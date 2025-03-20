# Additional Tools for SmartStack (SS4)

This document outlines additional tools that can be integrated into your SmartStack to establish best practices and enhance your development workflow.

## Core Technology Stack Extensions

### Babel
**What it does:** JavaScript compiler that transforms modern JavaScript code into backward-compatible versions
- Allows use of latest JavaScript features without worrying about browser compatibility
- Enables use of TypeScript, JSX, and other non-standard syntax through plugins
- Integrates with build systems like webpack and Vite
- **SmartStack Benefit:** Enables consistent code style across environments while maintaining compatibility

**Integration:**
```json
// .babelrc example
{
  "presets": [
    ["@babel/preset-env", { "targets": { "node": "current" } }],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime", { "regenerator": true }]
  ]
}
```

### Redux
**What it does:** State management library for JavaScript applications
- Centralizes application state in a single store
- Makes state changes predictable through pure functions called reducers
- Provides middleware system for handling side effects
- **SmartStack Benefit:** Standardized state management pattern for complex applications

**Integration with Redux Toolkit (recommended):**
```tsx
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import subscriptionReducer from './features/subscription/subscriptionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    subscription: subscriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### GraphQL
**What it does:** Query language and runtime for APIs
- Enables clients to request exactly the data they need
- Aggregates data from multiple sources into a single endpoint
- Provides strong type system for API contracts
- **SmartStack Benefit:** Efficient data fetching, reducing over/under-fetching issues

**Integration with Apollo Client:**
```tsx
// apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### React Native
**What it does:** Framework for building native mobile apps using React
- Uses the same component concepts as React for web
- Compiles to native code for iOS and Android
- Shares business logic between web and mobile applications
- **SmartStack Benefit:** Extend your SaaS to mobile platforms with shared codebase

**Not typically part of web-based SmartStack, but valuable for cross-platform strategies**

## Testing and Quality Tools

### Jest
**What it does:** JavaScript testing framework
- Unit, integration, and snapshot testing
- Mocking capabilities
- Test coverage reporting
- **SmartStack Benefit:** Standardizes testing practices across components

**Integration:**
```json
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1'
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
};
```

### React Testing Library
**What it does:** Testing utilities for React components
- Encourages testing from a user's perspective
- Focuses on accessibility and user interactions
- Works well with Jest
- **SmartStack Benefit:** Ensures components are built with user interaction in mind

**Example Test:**
```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Storybook
**What it does:** UI component development environment
- Builds components in isolation
- Creates a component library/documentation
- Enables visual testing
- **SmartStack Benefit:** Accelerates component development and ensures consistency

**Integration:**
```jsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

## Development Workflow Tools

### ESLint + Plugins
**What it does:** Static code analysis tool to identify problematic patterns
- Enforces code style and best practices
- Integrates with various frameworks through plugins
- Customizable to team/project needs
- **SmartStack Benefit:** Consistent code quality across the entire application

**Extended Configuration:**
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["react", "react-hooks", "@typescript-eslint"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

### Husky + lint-staged
**What it does:** Git hooks to enforce quality checks before commits
- Prevents bad code from entering the repository
- Runs tests, linting, formatting on staged files
- Customizable workflow
- **SmartStack Benefit:** Enforces quality standards automatically during development

**Integration:**
```json
// package.json (partial)
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

## Data Management and API Tools

### React Query (TanStack Query)
**What it does:** Data fetching and state management library
- Handles caching, background updates, and stale data
- Simplifies data fetching logic
- Reduces boilerplate for async operations
- **SmartStack Benefit:** Standardized data fetching with built-in optimization

**Integration:**
```tsx
// _app.tsx (or similar)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Axios
**What it does:** Promise-based HTTP client for browsers and Node.js
- Creates reusable API instances
- Intercepts requests and responses
- Transforms request and response data
- **SmartStack Benefit:** Consistent API communication pattern

**Integration:**
```tsx
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Form Handling and Validation

### React Hook Form + Zod
**What it does:** Form handling library with validation
- Minimizes re-renders
- Provides validation through schemas
- Handles form state efficiently
- **SmartStack Benefit:** Standardized form handling pattern with strong typing

**Already included in your shadcn/ui form pattern, but here's an expanded example:**
```tsx
// enhanced-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

// Define schema with more advanced validation
const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export function EnhancedForm() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return api.post('/register', {
        username: values.username,
        email: values.email,
        password: values.password,
      });
    },
    onSuccess: () => {
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Create password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="Confirm password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
```

## Recommended SmartStack Configuration

Based on your SS4-B1 workflow, here's a recommended configuration that balances complexity with productivity:

### Core Stack
- **Next.js**: Foundation framework
- **TypeScript**: Type safety
- **shadcn/ui**: UI component system
- **React Hook Form + Zod**: Form handling
- **TanStack Query**: Data fetching
- **Axios**: API client

### Quality Tools
- **ESLint + Plugins**: Code quality
- **Prettier**: Formatting
- **Jest + React Testing Library**: Testing
- **Husky + lint-staged**: Git hooks

### Optional Extensions
- **Redux Toolkit**: For complex state management needs
- **GraphQL + Apollo**: For complex data requirements
- **Storybook**: For building component libraries

This configuration provides a robust foundation for SaaS development while keeping the learning curve manageable and supporting the SS4-B1 workflow principles. 