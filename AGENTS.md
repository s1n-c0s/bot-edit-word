# AGENTS.md - Developer Guide for bot-edit-word

## Project Overview

This is a cross-platform desktop application built with:
- **Electron** - Desktop framework
- **React** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **bun** - Package manager and runtime
- **electron-builder** - Packaging/distribution
- **Vitest** - Testing framework
- **ESLint + Prettier** - Linting and formatting

## Commands

### Development
```bash
bun run dev          # Start Vite dev server + Electron in development mode
```

### Building
```bash
bun run build       # Build React app for production
bun run dist        # Package app with electron-builder (creates .exe/.app)
bun run dist:win    # Build for Windows only
bun run dist:mac    # Build for macOS only
bun run dist:linux  # Build for Linux only
```

### Linting & Formatting
```bash
bun run lint        # Run ESLint
bun run lint:fix    # Auto-fix lint issues
bun run format      # Format code with Prettier
bun run typecheck   # Run TypeScript type checking
```

### Testing
```bash
bun run test              # Run all tests
bun run test <file>       # Run a single test file (e.g., bun run test src/utils/helpers.test.ts)
bun run test --watch      # Run tests in watch mode
bun run test --coverage   # Run tests with coverage report
```

## Project Structure

```
bot-edit-word/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry
│   └── preload.ts        # Preload script (context bridge)
├── src/                   # React renderer (Vite-managed)
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Root component
│   └── main.tsx          # Renderer entry
├── public/               # Static assets
├── dist/                 # Built output
├── release/              # Packaged executables
├── package.json
├── vite.config.ts
├── tsconfig.json
├── electron-builder.json
├── .eslintrc.cjs
├── .prettierrc
└── vitest.config.ts
```

## Code Style Guidelines

### TypeScript
- Use strict mode in tsconfig.json
- Always define return types for functions
- Use `interface` for object shapes, `type` for unions/aliases
- Avoid `any`, use `unknown` when type is truly unknown
- Prefer generics over type assertions

### Imports
Order imports in this sequence:
1. External libraries (React, etc.)
2. Internal modules (from `src/`)
3. Relative imports (from `./` or `../`)

```typescript
// 1. External
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';

// 3. Relative
import { formatDate } from '../utils/date';
import type { User } from './types';
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfile.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Files with multiple exports**: index.ts for barrel exports

### React Patterns
- Use functional components with hooks
- Define prop types with TypeScript interfaces
- Extract custom hooks for reusable logic
- Use composition over inheritance
- Keep components small and focused

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### Error Handling
- Use try/catch with specific error types
- Return Result types for functions that can fail
- Log errors with appropriate context
- Show user-friendly error messages in UI

```typescript
// Good - explicit error handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new Error(`User ${id} not found`);
    }
    throw new Error('Failed to fetch user');
  }
}
```

### Electron-Specific
- Use context isolation (enabled by default)
- Define IPC channels as constants
- Use preload script for safe API exposure
- Never expose Node.js APIs directly to renderer
- Use `ipcRenderer.invoke()` for request/response patterns

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string) => ipcRenderer.invoke('file:save', content),
});

// Usage in renderer
const file = await window.electronAPI.openFile();
```

### Testing
- Place tests next to source files or in `__tests__/` directory
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies
- Test user-facing behavior, not implementation details

```typescript
describe('formatDate', () => {
  it('formats date as MM/DD/YYYY', () => {
    // Arrange
    const date = new Date('2024-01-15');

    // Act
    const result = formatDate(date);

    // Assert
    expect(result).toBe('01/15/2024');
  });
});
```

### Git Conventions
- Use conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Keep commits atomic and focused
- Run lint/typecheck before committing
- Run tests before pushing

## CI/CD Notes

- electron-builder creates platform-specific builds
- macOS builds require code signing for distribution
- Windows builds can be created on any platform
- Linux builds require `sudo apt-get install libgtk-3-dev` on Linux
