# Corvenhal — Claude Code Notes

## Package Manager

This project uses **Bun**. Always use `bun` instead of `npm` or `yarn`.

```
bun install          # install dependencies
bun run dev          # start dev server (port 3000)
bun run build        # production build
bun run test         # run tests (vitest)
bun run lint         # eslint
bunx tsc --noEmit    # type-check without building
```

A `bun.lock` file is present at the root. Do not generate a `package-lock.json` or `yarn.lock`.

## Stack

- **Next.js 16** (App Router, standalone output)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Vitest** for tests
- **Prisma** for database (see `db:*` scripts)
- **shadcn/ui** components under `src/components/ui/`
