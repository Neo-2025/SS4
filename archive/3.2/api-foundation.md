# API Foundation Documentation

## Current Implementation

The API foundation establishes a consistent pattern for building type-safe, validated API endpoints in the SmartScale S4 project. It supports the single-user authentication approach while enabling future expansion.

### Response Types

```typescript
// Base API response type (lib/types/index.ts)
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Success response pattern
type SuccessResponse = {
  data: string | Record<string, any>;
};

// Error response pattern
type ErrorResponse = {
  error: string;
  details?: unknown;
};
```

### Validation Framework

The validation framework uses Zod for schema validation with a consistent pattern:

```typescript
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function validateRequest<T>(
  req: NextApiRequest,
  schema: z.Schema<T>
): Promise<ValidationResult<T>>
```

### Error Handling

Custom error handling that provides consistent API responses:

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(error: unknown, res: NextApiResponse): void
```

## What's Missing/Next Steps

1. **API Route Implementation**
   - Create actual API endpoints in `/app/api/`
   - Implement Next.js 14 Route Handlers pattern
   - Connect to database operations

2. **Authentication Integration**
   - Add middleware protection for API routes
   - Implement role-based authorization checks
   - Add API key authentication option

3. **Advanced Features**
   - Rate limiting for endpoints
   - Logging framework for API calls
   - API versioning strategy
   - Request caching

4. **Documentation**
   - Full API endpoint documentation
   - Example usage patterns
   - Client-side data fetching

## Example Implementation Pattern

Follow this pattern for new API endpoints:

```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError } from '@/lib/error-handling';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Validation schema
const createResourceSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
});

// GET handler
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Implement resource fetch logic
    const result = { data: 'Resource data' };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    const status = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status }
    );
  }
}
``` 