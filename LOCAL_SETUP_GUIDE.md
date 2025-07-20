# SoulSense AI - Local Setup Guide

## Overview
SoulSense is an AI-powered mental health therapy application with four distinct therapeutic personas (Dr. Sarah, Maya, Alex, Marcus) built with React frontend and Node.js/Express backend, integrated with PostgreSQL database and Claude 3.5 Sonnet AI.

## Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or cloud like Supabase)
- OpenRouter API key for Claude access

## Quick Setup with Gemini CLI

### 1. Create Project Directory and Initialize
```bash
mkdir soulsense-ai
cd soulsense-ai
npm init -y
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install express react react-dom wouter @tanstack/react-query
npm install @anthropic-ai/sdk openai zod drizzle-orm drizzle-zod
npm install @neondatabase/serverless @supabase/supabase-js
npm install tailwindcss class-variance-authority clsx tailwind-merge
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-tabs
npm install @radix-ui/react-avatar @radix-ui/react-button @radix-ui/react-card
npm install @hookform/resolvers react-hook-form framer-motion
npm install express-session connect-pg-simple passport passport-local
npm install date-fns recharts vaul embla-carousel-react
npm install next-themes react-icons input-otp react-day-picker
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog
npm install @radix-ui/react-aspect-ratio @radix-ui/react-checkbox
npm install @radix-ui/react-collapsible @radix-ui/react-context-menu
npm install @radix-ui/react-dropdown-menu @radix-ui/react-hover-card
npm install @radix-ui/react-label @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover
npm install @radix-ui/react-progress @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slider
npm install @radix-ui/react-slot @radix-ui/react-switch
npm install @radix-ui/react-toast @radix-ui/react-toggle
npm install @radix-ui/react-toggle-group @radix-ui/react-tooltip
npm install cmdk react-resizable-panels tailwindcss-animate
npm install @tailwindcss/typography tw-animate-css

# Dev dependencies
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D @types/express @types/express-session @types/passport
npm install -D @types/passport-local @types/connect-pg-simple @types/ws
npm install -D vite @vitejs/plugin-react tsx esbuild drizzle-kit
npm install -D tailwindcss autoprefixer postcss @tailwindcss/vite
```

### 3. Project Structure
Create the following directory structure:
```
soulsense-ai/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
├── server/
│   ├── personas/
│   ├── db.ts
│   ├── storage.ts
│   ├── routes-clean.ts
│   ├── index.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── drizzle.config.ts
└── .env
```

## Key Files to Download/Create

### 1. Configuration Files

**package.json** - Update scripts section:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

**tsconfig.json**:
```json
{
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/typescript/tsbuildinfo",
    "noEmit": true,
    "module": "ESNext",
    "strict": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

**vite.config.ts**:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
```

**tailwind.config.ts**:
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        lavender: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4dcff',
          300: '#d1c1ff',
          400: '#b49bff',
          500: '#9570ff',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        'rosalia': ['Rosalia', 'serif'],
        'sans': ['Rosalia', 'Georgia', 'serif'],
        'serif': ['Rosalia', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

**postcss.config.js**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**components.json**:
```json
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": false,
    "tsx": true,
    "tailwind": {
      "config": "tailwind.config.ts",
      "css": "client/src/index.css",
      "baseColor": "neutral",
      "cssVariables": true,
      "prefix": ""
    },
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils",
      "ui": "@/components/ui",
      "lib": "@/lib",
      "hooks": "@/hooks"
    }
}
```

### 2. Environment Setup

**.env**:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=your_postgresql_database_url_here
DEBUG=true
ENVIRONMENT=development
```

**drizzle.config.ts**:
```typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

## Essential Source Files to Download

You'll need to download these key files from the Replit project:

### Core Application Files:
1. **shared/schema.ts** - Database schema definitions
2. **server/index.ts** - Main server entry point
3. **server/vite.ts** - Vite development server integration
4. **server/db.ts** - Database connection
5. **server/storage.ts** - Database storage interface
6. **server/routes-clean.ts** - API routes
7. **server/replitAuth.ts** - Authentication system

### Frontend Files:
8. **client/index.html** - HTML template
9. **client/src/main.tsx** - React entry point
10. **client/src/App.tsx** - Main React app
11. **client/src/index.css** - Global styles
12. **client/src/lib/queryClient.ts** - API client setup
13. **client/src/lib/utils.ts** - Utility functions

### Persona System:
14. **server/personas/maya_enhanced.ts** - Maya spiritual persona
15. **server/personas/alex_enhanced.ts** - Alex best friend persona
16. **server/personas/sarah_enhanced.ts** - Dr. Sarah clinical persona
17. **server/personas/marcus_enhanced.ts** - Marcus life coach persona

### UI Components:
18. **client/src/components/simple-chat-overlay.tsx** - Chat interface
19. **client/src/components/ui/** - All shadcn UI components
20. **client/src/pages/** - All page components

## Setup Steps

### 1. Get API Keys
- **OpenRouter API Key**: Sign up at https://openrouter.ai/ to get Claude 3.5 Sonnet access
- **Database**: Set up PostgreSQL (recommend Supabase for easy setup)

### 2. Database Setup
```bash
# Push database schema
npm run db:push
```

### 3. Run Development Server
```bash
npm run dev
```

The app will run on `http://localhost:5000` with both frontend and backend.

## Environment Variables Required

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
DATABASE_URL=postgresql://user:password@host:port/database
DEBUG=true
ENVIRONMENT=development
```

## Features Available
- ✅ Four therapeutic personas (Dr. Sarah, Maya, Alex, Marcus)
- ✅ Real-time chat with Claude 3.5 Sonnet
- ✅ Session tracking and analytics
- ✅ PostgreSQL database integration
- ✅ Responsive React frontend
- ✅ Express.js backend with proper routing

## Troubleshooting
1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **API Key**: Verify OpenRouter API key is valid and has Claude access
3. **Dependencies**: Run `npm install` if any modules are missing
4. **TypeScript**: Run `npm run check` to verify type checking

This setup replicates the exact Replit environment locally with all enhanced personas and full functionality.