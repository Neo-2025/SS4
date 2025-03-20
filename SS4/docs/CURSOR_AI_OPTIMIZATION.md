# Cursor AI Optimization for SS4 Development

This document summarizes recommendations for optimizing Cursor AI with Claude 3.7 Sonnet Max for SS4 development, with a special focus on React component patterns and shadcn/ui integration.

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

### shadcn/ui Component Patterns

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
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Add other form fields */}
        <Button type="submit">Submit</Button>
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
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
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
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## US-007 CLI Command UI Pattern

For the March Madness CLI interface (US-007), this pattern is recommended:

```tsx
// CommandTerminal.tsx
'use client'

import { useState } from 'react'
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

export function CommandTerminal({ role = 'user' }) {
  const [history, setHistory] = useState<CommandResponse[]>([])
  const [input, setInput] = useState('')
  
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
  
  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      <ScrollArea className="flex-1 p-4 bg-black text-green-400 font-mono">
        {history.map((entry, i) => (
          <div 
            key={i} 
            className={`mb-2 ${
              entry.type === 'error' 
                ? 'text-red-400' 
                : entry.type === 'input' 
                  ? 'text-blue-400'
                  : 'text-green-400'
            }`}
          >
            {entry.type === 'input' ? '> ' : ''}
            {entry.content}
            
            {entry.data && entry.data.content && (
              <div className="mt-2 p-3 bg-gray-900 rounded text-white whitespace-pre-wrap">
                {entry.data.content}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      
      <div className="border-t border-gray-800 p-2">
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder={role === 'admin' ? "Enter admin command..." : "Enter command..."}
            value={input}
            onValueChange={setInput}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCommand(input)
              }
            }}
            className="font-mono"
          />
          {/* Optional command suggestions */}
          <CommandList>
            <CommandEmpty>No suggestions found.</CommandEmpty>
            <CommandGroup heading="Common Commands">
              <CommandItem onSelect={() => setInput(">h")}>
                >h - Help
              </CommandItem>
              <CommandItem onSelect={() => setInput(">lb")}>
                >lb - Leaderboard
              </CommandItem>
              <CommandItem onSelect={() => setInput(">b")}>
                >b - Balance
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  )
}
```

## Effective Prompting for Components

When requesting Claude to create components, use these prompting patterns:

1. **Specify Pattern to Use**
   ```
   Create a form component following the shadcn/ui form pattern for [specific purpose]
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

4. **Request Complete Implementation**
   ```
   Implement the complete component with:
   - All necessary imports
   - Proper client directive
   - Type definitions
   - State management
   - Error handling
   - Loading states
   ```

## Best Practices for SS4-B1 Component Development

1. **Isolate Component Logic**
   - Create separate files for complex logic
   - Use custom hooks for reusable functionality
   - Keep components focused on a single responsibility

2. **Follow shadcn/ui Conventions**
   - Use consistent naming patterns
   - Properly implement form control patterns
   - Utilize composition over inheritance

3. **Document Component API**
   - Add JSDoc comments for props
   - Document component usage patterns
   - Create example implementations

4. **Test Component Patterns**
   - Test in isolation before integration
   - Verify in preview deployments
   - Document successful patterns in knowledge base

## Conclusion

By using Claude 3.7 Sonnet Max with these optimized settings, extensions, and component patterns, your SS4-B1 development workflow will produce higher quality, more consistent React components. The patterns provided serve as a foundation for building robust SaaS features that align with the P1.1 story suite implementation requirements. 