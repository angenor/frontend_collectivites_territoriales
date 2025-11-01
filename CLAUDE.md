# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Nuxt 4 web application for managing information about French territorial authorities ("Collectivités Territoriales"). Built with Vue 3, Nuxt, Supabase (PostgreSQL backend), and Tailwind CSS.

## Essential Commands

**Development:**
```bash
pnpm install          # Install dependencies (MUST use pnpm, not npm)
pnpm dev              # Start dev server at http://localhost:3000
```

**Production:**
```bash
pnpm build            # Build for production (outputs to .output/)
pnpm preview          # Preview production build locally
pnpm generate         # Generate static HTML (SSG)
```

**Database:**
```bash
# Database is managed through Supabase Dashboard
# Connection string in .env file (SUPABASE_URL and SUPABASE_KEY)
```

## Critical Setup Requirements

1. **Package Manager**: MUST use `pnpm`. The project uses pnpm lockfile v9.0.
2. **Backend**: Supabase for database, authentication, and storage. Configure `SUPABASE_URL` and `SUPABASE_KEY` in `.env` file.
3. **Database**: PostgreSQL managed by Supabase. Use Supabase Dashboard or SQL Editor for schema management.

## Architecture Overview

### Routing System (Auto-routed by Nuxt)

Pages in `app/pages/` are automatically converted to routes:
- `pages/index.vue` → `/`
- `pages/about.vue` → `/about`
- `pages/contact.vue` → `/contact`
- `pages/dashboard.vue` → `/dashboard`
- `pages/blog/index.vue` → `/blog`
- `pages/blog/[id].vue` → `/blog/:id` (dynamic route)

### Layout System

Two layouts exist in `app/layouts/`:
- **default.vue**: Used by most pages (includes Nav.vue component)
- **mylayout.vue**: Alternative layout (currently used by contact page)

Pages specify layouts via `definePageMeta({ layout: 'layoutname' })` or use default.

### Middleware

- **global-auth.global.ts**: Runs on every route change (logs navigation)
- **log.ts**: Page-specific middleware (applied via definePageMeta)

All middleware files use Nuxt's `defineNuxtRouteMiddleware()`.

### Database & Backend

- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Client**: `@supabase/supabase-js` for database queries
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Connection**: Via `SUPABASE_URL` and `SUPABASE_KEY` in `.env`

When adding tables:
1. Use Supabase Dashboard SQL Editor or Table Editor
2. Define Row Level Security (RLS) policies
3. Generate TypeScript types if needed

### Styling

- **Tailwind CSS**: Primary framework (configured in nuxt.config.ts with Vite plugin)
- **Animate.css**: Available globally for animations
- Main CSS: `app/assets/css/main.css` (imports Tailwind directives)
- Component styles: Supports `<style lang="scss" scoped>`

### Content Management

- Nuxt Content installed for markdown/MDC rendering
- Content files location: `.data/content/`

## Module Configuration

Key Nuxt modules in `nuxt.config.ts`:
- `@nuxt/image`: Image optimization
- `@nuxt/content`: Markdown content management
- `@nuxt/ui`: UI component library
- `@nuxt/test-utils`: Testing utilities (not yet configured)

## Project Documentation

- **Requirements**: `bank/cahier_des_charges/TIMG_PCQVP_TdR_Prestataire-Conception-Plateforme-Web.pdf`
- **Data Tables**: `bank/cahier_des_charges/Tableaux_de_Compte_Administratif.xlsx`

## Important Development Notes

- Auto-imports enabled: Components, composables, and utilities are auto-imported by Nuxt
- DevTools enabled in dev mode for debugging
- TypeScript configuration references Nuxt-generated configs in `.nuxt/`
- No linting or testing setup currently configured
- Compatibility date set to 2025-07-15
