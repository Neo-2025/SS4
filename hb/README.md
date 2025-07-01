# HealthBench CLI

## Overview

HealthBench is a comprehensive CLI-based health metrics analysis tool that enables healthcare professionals and researchers to analyze, track, and visualize health data efficiently.

Built with Next.js, TypeScript, and integrated with Supabase, HealthBench offers a command-line interface within a web application, combining the power of CLI tools with the accessibility of web applications.

## Features

- **CLI Interface**: Powerful command-line interface in the browser
- **Command History**: Track and reuse previously executed commands
- **Data Visualization**: Visualize health metrics and trends (coming soon)
- **Secure Authentication**: Role-based access control (coming soon)
- **Database Integration**: Persistent storage with Supabase

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Neo-2025/hb.git
   cd hb
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Commands

- `health`: Check the health of the system
  - Usage: `health [--verbose]`
  - Example: `health --verbose`

More commands coming soon!

## Project Structure

```
hb/
├── app/                # Next.js app directory
│   ├── components/     # React components
│   │   └── terminal/   # Terminal UI components
│   ├── lib/            # Utility functions and core logic
│   │   └── commands/   # CLI commands implementation
│   ├── styles/         # Global styles
│   ├── layout.tsx      # App layout
│   └── page.tsx        # Main page
├── kb/                 # Knowledge base
│   ├── docs/           # Documentation
│   └── patterns/       # Pattern documentation
├── public/             # Static assets
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Development

HealthBench follows the SS5 methodology with pattern-based development. The core patterns include:

- CLI Command Registry Pattern
- Terminal UI Layout Pattern
- Command Response Handling Pattern

See the `/kb/patterns/` directory for detailed pattern documentation.

## License

MIT
