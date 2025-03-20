# Pattern: Modern Stripe SaaS Subscription

## Problem

Implementing a secure, compliant, and user-friendly subscription system requires handling complex payment flows, subscription lifecycle events, and maintaining subscription state in the application. This complexity can lead to security risks, poor user experience, and maintenance challenges if not properly architected.

## Solution

Leverage Stripe's modern components (Pricing Tables, Checkout, Customer Portal) to handle the complex parts of subscription management while maintaining a clean separation of concerns in your application. This pattern follows the XS-sized implementation approach recommended in SS4-B1.

## Implementation

### 1. Core Components

```typescript
// components/subscription/PricingTableEmbed.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PricingTableProps {
  pricingTableId: string;
  publishableKey: string;
  customerEmail?: string;
  customerIdentifier?: string;
}

export function PricingTableEmbed({ pricingTableId, publishableKey, customerEmail, customerIdentifier }: PricingTableProps) {
  useEffect(() => {
    // Load Stripe.js and Pricing Table
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <stripe-pricing-table
        pricing-table-id={pricingTableId}
        publishable-key={publishableKey}
        customer-email={customerEmail}
        client-reference-id={customerIdentifier}
      ></stripe-pricing-table>
    </div>
  );
}
```

### 2. API Routes

```typescript
// app/api/stripe/create-checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { priceId, successUrl, cancelUrl } = await req.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-10-16',
    });
    
    // Get or create Stripe customer for this user
    const { data: customerData } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();
    
    let customerId = customerData?.stripe_customer_id;
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID to database
      await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId,
        });
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: true },
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
```

### 3. Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe with API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
  
  // Handle specific Stripe events
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get user_id from customers table
  const { data: customerData, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (customerError || !customerData) {
    console.error('Error finding customer:', customerError);
    return;
  }
  
  const userId = customerData.user_id;
  const priceId = subscription.items.data[0].price.id;
  const status = subscription.status;
  
  // Update subscriptions table
  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
  
  if (upsertError) {
    console.error('Error updating subscription:', upsertError);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  // Similar to handleSubscriptionChange but sets status to canceled
  // ...
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Record successful payment
  // ...
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment, possibly notify user
  // ...
}
```

### 4. Customer Portal Integration

```typescript
// components/subscription/ManageSubscriptionButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  
  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const { url } = await response.json();
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleManageSubscription}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
}
```

### 5. Database Schema

```sql
-- Stripe-related database schema

-- Link users to Stripe customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices record
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_invoice_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER NOT NULL,
  invoice_pdf TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX customers_user_id_idx ON customers(user_id);
CREATE INDEX customers_stripe_customer_id_idx ON customers(stripe_customer_id);
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
```

## Usage

### 1. Displaying Pricing Table

```tsx
// app/(authenticated)/subscribe/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PricingTableEmbed } from '@/components/subscription/PricingTableEmbed';

export default async function SubscribePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h1>
      
      <PricingTableEmbed
        pricingTableId={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID as string}
        publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string}
        customerEmail={session.user.email}
        customerIdentifier={session.user.id}
      />
    </div>
  );
}
```

### 2. Checking Subscription Status

```tsx
// lib/subscription.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'incomplete' | 'past_due' | 'unpaid' | 'none';

export async function getUserSubscription() {
  const supabase = createClientComponentClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { status: 'none' as SubscriptionStatus };
  }
  
  // Get subscription from database
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, prices:stripe_price_id(*)')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching subscription:', error);
    return { status: 'none' as SubscriptionStatus };
  }
  
  if (!data) {
    return { status: 'none' as SubscriptionStatus };
  }
  
  return {
    ...data,
    status: data.status as SubscriptionStatus,
  };
}

export function useSubscription() {
  // React Query hook implementation for subscription status
  // ...
}
```

### 3. Route Protection

```tsx
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if the route requires subscription
  const requiresSubscription = req.nextUrl.pathname.startsWith('/premium');
  
  if (requiresSubscription) {
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check subscription status
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();
    
    if (error || !data) {
      // User has no active subscription, redirect to subscription page
      const redirectUrl = new URL('/subscribe', req.url);
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/premium/:path*'
  ],
};
```

## Benefits

1. **PCI Compliance**: Sensitive payment information is handled exclusively by Stripe, reducing security risks.

2. **User Experience**: Modern UI components like Pricing Tables provide a polished, professional experience.

3. **Maintenance**: Stripe handles complex subscription logic, reducing custom code requirements.

4. **Scalability**: This pattern works from startup to enterprise scale without significant changes.

5. **Self-Service**: Customer Portal allows users to manage their subscriptions without developer intervention.

6. **Webhook-Driven**: Event-based architecture ensures your application state stays in sync with Stripe.

7. **XS Pattern Compatible**: Components can be implemented incrementally following the SS4-B1 workflow.

## Environment Setup

Required environment variables:

```
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_...

# Application URLs
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
```

## Best Practices

1. **Always verify webhook signatures** to prevent fraudulent events.

2. **Use idempotency keys** for API calls to prevent duplicate charges during retries.

3. **Implement proper error handling** for payment failures and provide clear user feedback.

4. **Store subscription status in your database** rather than querying Stripe API for every check.

5. **Leverage Stripe's testing tools** including test cards and webhook simulators.

6. **Separate test and production environments** with distinct API keys and webhooks.

7. **Follow the principle of least privilege** when configuring Stripe API keys.

## Related Patterns

- **User Authentication Pattern**: Provides the authenticated user context required for subscriptions.
- **Protected Routes Pattern**: Controls access to premium features based on subscription status.
- **User Profile Management Pattern**: Often extended to show subscription details.
- **Notifications Pattern**: Can be triggered by subscription events (e.g., renewal reminder).

---

*This pattern is part of the SS4-B1 framework, developed to facilitate rapid, maintainable SaaS application development following XS-sized implementation patterns.* 