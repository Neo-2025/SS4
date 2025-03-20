# Cursor AI Optimization for SS4 Development

This document summarizes recommendations for optimizing Cursor AI with Claude 3.7 Sonnet Max for SS4 development, with a special focus on React component patterns and shadcn/ui integration. All UI components should follow the Cursor AI look and feel for a consistent experience.

## Model Selection and Configuration

### Recommended Model Configuration
- **Model**: Claude 3.7 Sonnet Max
- **Mode**: Model+Fast for consistent behavior with speed optimizations
- **Thinking Tokens**: 24,000-32,000 (increased from 8,000)
  - Provides deeper analysis capabilities
  - Allows more thorough exploration of implementation options
  - Enables better pattern recognition across components
  - Worth the small additional cost for higher quality output

### .cursor.rules Optimization
```json
{
  "version": 1,
  "model": "claude-3-7-sonnet",  // Updated from 3.5
  "thinking": {
    "enabled": true,
    "max_tokens": 24000  // Increased from 8000
  }
}
```

## Context Management

### Context Behavior
- Context is reloaded with each new prompt
- Files with green indicators are included in every prompt
- When switching models, context is automatically reapplied
- Conversation history is maintained within context window limits

### Optimizing Context
- Include example components in context
- Add configuration files (.eslintrc, tsconfig.json)
- Include pattern documentation for reference
- Select files strategically to maximize context relevance

## Cursor AI UI Design System

All SS4 UI components should adopt the Cursor AI design aesthetic for a consistent experience. This includes:

### Color Palette
- **Background**: `#1E1E1E` (dark gray/almost black)
- **Primary Text**: `#FFFFFF` (white)
- **Secondary Text**: `#A0A0A0` (light gray)
- **Accent**: `#0D99FF` (bright blue)
- **Success**: `#3ECF8E` (green)
- **Warning**: `#F7B955` (yellow/amber)
- **Error**: `#FF5252` (red)
- **Subtle Borders**: `#333333` (dark gray)
- **Code Backgrounds**: `#2D2D2D` (slightly lighter than main background)

### Typography
- **Primary Font**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`
- **Monospace Font**: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace`
- **Base Font Size**: `14px`
- **Line Height**: `1.5`

### Spacing
- **Base Unit**: `4px`
- **Standard Padding**: `16px` (4 × base unit)
- **Component Spacing**: `12px` (3 × base unit)
- **Section Spacing**: `24px` (6 × base unit)

### Component Styling
- **Border Radius**: `6px` for components, `4px` for smaller elements
- **Shadow**: `0 2px 8px rgba(0, 0, 0, 0.3)` for elevated components
- **Transitions**: `150ms ease` for hover/focus states
- **Focus Rings**: `2px` `#0D99FF` (accent color)

## Login Screen Pattern

For authentication screens, mimic the Cursor AI login experience:

```tsx
// CursorStyleLogin.tsx
'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { GithubIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Define schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

export function CursorStyleLogin() {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    // Implement login logic
    console.log(values)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E1E1E] text-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-[#A0A0A0]">Sign in to your account</p>
        </div>
        
        <div className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-12 bg-[#2D2D2D] border-[#333333] hover:bg-[#333333] text-white"
            onClick={() => {}}
          >
            <GithubIcon className="mr-2 h-5 w-5" />
            Continue with Github
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1E1E1E] text-[#A0A0A0]">Or continue with</span>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#A0A0A0]">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="name@example.com" 
                        {...field} 
                        className="h-12 bg-[#2D2D2D] border-[#333333] text-white placeholder:text-[#666666]"
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5252]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-[#A0A0A0]">Password</FormLabel>
                      <Link href="/forgot-password" className="text-sm text-[#0D99FF] hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="h-12 bg-[#2D2D2D] border-[#333333] text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5252]" />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#0D99FF] hover:bg-[#0A85E9] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-[#A0A0A0] text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#0D99FF] hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## React Component Development

### Recommended VS Code Extensions
1. **ES7+ React/Redux/GraphQL/React-Native snippets**
   - Provides standard component structures
   - Snippet templates guide Claude's component creation
   - Creates consistent patterns for components

2. **ESLint + React Plugin**
   - Enforces React best practices
   - Ensures proper hook usage
   - Standardizes component structure

3. **TypeScript React Extensions**
   - Improves type definitions
   - Better prop typing for components
   - Enhanced hook type safety

4. **Prettier**
   - Maintains consistent formatting
   - Standardizes component layout

### shadcn/ui Component Patterns with Cursor AI Theming

#### Form Components Pattern
```tsx
// FormComponent.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

// Define schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  // Add other fields as needed
})

export function FormComponentName() {
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      // Other defaults
    },
  })

  // Define submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Implement submission logic
    console.log(values)
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-[#2D2D2D] p-4">
          <code className="text-white font-mono text-sm">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
      className: "bg-[#1E1E1E] text-white border border-[#333333]",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#A0A0A0]">Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your name" 
                  {...field} 
                  className="bg-[#2D2D2D] border-[#333333] text-white h-10 placeholder:text-[#666666]"
                />
              </FormControl>
              <FormMessage className="text-[#FF5252]" />
            </FormItem>
          )}
        />
        {/* Add other form fields */}
        <Button 
          type="submit" 
          className="bg-[#0D99FF] hover:bg-[#0A85E9] text-white"
        >
          Submit
        </Button>
      </form>
    </Form>
  )
}
```

#### Data Table Pattern
```tsx
// DataTable.tsx
'use client'

import { useState } from "react"
import { 
  ColumnDef, 
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from "@tanstack/react-table"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="bg-[#1E1E1E] text-white rounded-md">
      <div className="rounded-md border border-[#333333] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#2D2D2D]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-[#333333] hover:bg-[#333333]">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[#A0A0A0] font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-[#333333] hover:bg-[#2D2D2D]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-white">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[#A0A0A0]">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-[#333333] bg-[#2D2D2D] text-white hover:bg-[#333333] hover:text-white"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-[#333333] bg-[#2D2D2D] text-white hover:bg-[#333333] hover:text-white"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

#### Dialog Component Pattern
```tsx
// DialogComponent.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogComponentName() {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0D99FF] hover:bg-[#0A85E9] text-white">
          Open Dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1E1E1E] text-white border border-[#333333]">
        <DialogHeader>
          <DialogTitle className="text-white">Dialog Title</DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-[#A0A0A0]">
              Name
            </Label>
            <Input 
              id="name" 
              className="col-span-3 bg-[#2D2D2D] border-[#333333] text-white" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right text-[#A0A0A0]">
              Username
            </Label>
            <Input 
              id="username" 
              className="col-span-3 bg-[#2D2D2D] border-[#333333] text-white" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            className="bg-[#0D99FF] hover:bg-[#0A85E9] text-white"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## US-007 CLI Command UI Pattern

For the March Madness CLI interface (US-007), this pattern mimics the Cursor AI CLI look and feel:

```tsx
// CursorStyleCommandTerminal.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup,
  CommandItem
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { parseCommand } from '@/lib/command-parser'

type CommandResponse = {
  type: 'input' | 'output' | 'error'
  content: string
  data?: any
}

export function CursorStyleCommandTerminal({ role = 'user' }) {
  const [history, setHistory] = useState<CommandResponse[]>([])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [history])
  
  // Handle mobile keyboard focus
  useEffect(() => {
    const handleResize = () => {
      // Make sure CLI remains visible when keyboard opens on mobile
      if (window.innerHeight < 500) { // When keyboard is likely open
        window.scrollTo(0, document.body.scrollHeight)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const handleCommand = async (cmd: string) => {
    if (!cmd.trim()) return
    
    setInput('')
    setHistory(prev => [...prev, { type: 'input', content: cmd }])
    
    try {
      const response = await parseCommand(cmd, role)
      setHistory(prev => [...prev, { 
        type: 'output', 
        content: response.message,
        data: response.data 
      }])
    } catch (error) {
      setHistory(prev => [...prev, { 
        type: 'error', 
        content: error instanceof Error ? error.message : String(error)
      }])
    }
  }
  
  // Handle focus on CLI
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  
  return (
    <div 
      className="flex flex-col h-[80vh] md:h-[600px] border border-[#333333] rounded-md overflow-hidden bg-[#1E1E1E] shadow-md"
      onClick={focusInput}
    >
      {/* Terminal Header */}
      <div className="h-8 bg-[#2D2D2D] border-b border-[#333333] flex items-center px-3">
        <div className="flex space-x-2 items-center">
          <div className="w-3 h-3 rounded-full bg-[#FF5252]"></div>
          <div className="w-3 h-3 rounded-full bg-[#F7B955]"></div>
          <div className="w-3 h-3 rounded-full bg-[#3ECF8E]"></div>
        </div>
        <div className="flex-1 text-center text-[#A0A0A0] text-xs font-medium">
          Command Terminal
        </div>
      </div>
      
      {/* Output Area */}
      <ScrollArea 
        className="flex-1 p-4 font-mono text-sm overflow-auto"
        ref={scrollAreaRef as any}
      >
        {history.length === 0 && (
          <div className="text-[#A0A0A0] mb-4">
            Type a command to get started. Try <span className="text-[#0D99FF]">help</span> to see available commands.
          </div>
        )}
        
        {history.map((entry, i) => (
          <div 
            key={i} 
            className={`mb-2 ${
              entry.type === 'error' 
                ? 'text-[#FF5252]' 
                : entry.type === 'input' 
                  ? 'text-[#0D99FF]'
                  : 'text-[#3ECF8E]'
            }`}
          >
            {entry.type === 'input' ? '> ' : ''}
            {entry.content}
            
            {entry.data && entry.data.content && (
              <div className="mt-2 p-3 bg-[#2D2D2D] rounded border border-[#333333] text-white whitespace-pre-wrap">
                {entry.data.content}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      
      {/* Input Area */}
      <div className="border-t border-[#333333] p-2">
        <Command className="rounded-lg border border-[#333333] shadow-md bg-[#2D2D2D]">
          <CommandInput
            ref={inputRef}
            placeholder={role === 'admin' ? "Enter admin command..." : "Enter command..."}
            value={input}
            onValueChange={setInput}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCommand(input)
              }
            }}
            className="font-mono text-[#FFFFFF] placeholder:text-[#666666]"
          />
          {/* Command suggestions */}
          <CommandList className="bg-[#2D2D2D] text-white border-t border-[#333333]">
            <CommandEmpty className="text-[#A0A0A0] py-2">No suggestions found.</CommandEmpty>
            <CommandGroup heading="Common Commands" className="text-[#A0A0A0]">
              <CommandItem 
                onSelect={() => setInput(">help")}
                className="hover:bg-[#333333] text-white"
              >
                >help - Show available commands
              </CommandItem>
              <CommandItem 
                onSelect={() => setInput(">leaderboard")}
                className="hover:bg-[#333333] text-white"
              >
                >leaderboard - Show top players
              </CommandItem>
              <CommandItem 
                onSelect={() => setInput(">balance")}
                className="hover:bg-[#333333] text-white"
              >
                >balance - Check your token balance
              </CommandItem>
              <CommandItem 
                onSelect={() => setInput(">bet")}
                className="hover:bg-[#333333] text-white"
              >
                >bet - Place a bet on a team
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      
      {/* Mobile keyboard support notice - only shown on small viewports */}
      <div className="text-xs text-[#A0A0A0] text-center p-1 md:hidden">
        Tap anywhere to focus on command input
      </div>
    </div>
  )
}
```

## Mobile-First CLI Interface Features

The Cursor AI-style CLI has been specifically enhanced for mobile use with the following features:

1. **Mobile Keyboard Support**
   - Auto-focuses input when tapping anywhere in the terminal
   - Maintains visibility when mobile keyboard opens
   - Provides visual feedback for active input state

2. **Touch-Optimized Command Entry**
   - Tappable command suggestions for common actions
   - Properly sized touch targets for comfortable use
   - Clear visual hierarchy for command entry

3. **Responsive Layout**
   - Adjusts height based on viewport size
   - Maintains full functionality on small screens
   - Optimizes spacing for both desktop and mobile

4. **Keyboard Visibility Management**
   - Ensures CLI remains in view when virtual keyboard appears
   - Auto-scrolls to show newest content
   - Prevents UI jumps when keyboard toggles

5. **Visual Accessibility**
   - High contrast text for readability on small screens
   - Clear color coding for command types
   - Font sizes optimized for mobile viewing

## Effective Prompting for Components

When requesting Claude to create components, use these prompting patterns:

1. **Specify Pattern to Use**
   ```
   Create a form component following the Cursor AI-styled shadcn/ui form pattern for [specific purpose]
   ```

2. **Include Schema Requirements**
   ```
   Include form validation with zod for these fields:
   - username: string, min 3 characters
   - email: valid email
   - password: min 8 characters
   ```

3. **Specify Data Structure**
   ```
   The component should handle this data structure:
   ```typescript
   type User = {
     id: string
     name: string
     email: string
     role: 'admin' | 'user'
   }
   ```

4. **Request Complete Implementation with Cursor AI Styling**
   ```
   Implement the complete component with:
   - All necessary imports
   - Proper client directive
   - Type definitions
   - State management
   - Error handling
   - Loading states
   - Cursor AI-style dark theme and styling
   ```

## Best Practices for SS4-B1 Component Development

1. **Isolate Component Logic**
   - Create separate files for complex logic
   - Use custom hooks for reusable functionality
   - Keep components focused on a single responsibility

2. **Follow Cursor AI Design Principles**
   - Use the defined color palette consistently
   - Apply proper spacing and typography rules
   - Maintain the dark theme aesthetic throughout
   - Implement proper focus and hover states

3. **Document Component API**
   - Add JSDoc comments for props
   - Document component usage patterns
   - Create example implementations

4. **Test Component Patterns**
   - Test in isolation before integration
   - Verify in preview deployments
   - Test specifically on mobile devices
   - Document successful patterns in knowledge base

## Conclusion

By using Claude 3.7 Sonnet Max with these optimized settings, extensions, and Cursor AI-styled component patterns, your SS4-B1 development workflow will produce higher quality, more consistent React components. The patterns provided serve as a foundation for building robust SaaS features that align with the P1.1 story suite implementation requirements while maintaining a cohesive Cursor AI visual identity throughout the application. 