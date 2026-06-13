# Yedoma Labs TypeScript Stack Demo

<picture>
  <source media="(max-width: 640px)" srcset="https://raw.githubusercontent.com/yedoma-labs/assets/main/resized/banner-resized-mobile.png">
  <img src="https://raw.githubusercontent.com/yedoma-labs/assets/main/resized/banner-resized.png" alt="Project Header">
</picture>

Comprehensive demo showcasing Yedoma Labs' TypeScript ecosystem for building type-safe, production-ready Next.js applications.

## 🌐 Live Demo

**[yedoma-labs-demo.vercel.app](https://yedoma-labs-demo.vercel.app)**

## 🎯 What's Inside

This demo showcases **six** Yedoma Labs packages working together:

**✨ Updated: turar-config v0.2.0** - Now with hot reload, YAML/TOML support, and enhanced Vault integration!

1. **[@yedoma-labs/sir-forms](https://www.npmjs.com/package/@yedoma-labs/sir-forms)** v0.2.0
   - Type-safe React Server Actions form library
   - Controlled components with field-level state
   - React 19 compatible

2. **[@yedoma-labs/suruy-form-actions](https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions)** v0.1.0
   - Progressive enhancement forms (~3KB)
   - Built-in zero-dependency validator
   - Server-first validation

3. **[@yedoma-labs/ichchi-state](https://www.npmjs.com/package/@yedoma-labs/ichchi-state)**
   - Atomic state management
   - Persistent storage (localStorage)
   - Cross-tab synchronization

4. **[@yedoma-labs/turar-config](https://www.npmjs.com/package/@yedoma-labs/turar-config)** v0.2.0
   - Multi-format config files (JSON, YAML, TOML)
   - Hot reload / file watching
   - Environment cascading (default → NODE_ENV)
   - Variable interpolation
   - HashiCorp Vault integration (token + AppRole)
   - Built on bylyt-env-guard

5. **[@yedoma-labs/bylyt-env-guard](https://www.npmjs.com/package/@yedoma-labs/bylyt-env-guard)**
   - Environment variable validation
   - Type-safe env access
   - Runtime checks

6. **[@yedoma-labs/suruk-logger](https://www.npmjs.com/package/@yedoma-labs/suruk-logger)**
   - Winston-compatible Pino wrapper
   - 5-10x faster than Winston
   - Request context binding
   - Structured logging with TypeScript

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Visit http://localhost:3000

## 📁 Project Structure

```
yedoma-labs-demo/
├── app/
│   ├── page.tsx                    # Home page
│   ├── actions.ts                  # sir-forms server actions
│   ├── config/
│   │   ├── page.tsx               # turar-config + bylyt-env-guard demo
│   │   └── actions.ts             # Configuration server actions
│   ├── features/                   # Advanced ichchi-state features
│   ├── suruy/
│   │   ├── page.tsx               # suruy-form-actions showcase
│   │   ├── actions.ts             # Built-in validator examples
│   │   └── zod-actions.ts         # Zod integration examples
│   ├── hybrid/
│   │   ├── page.tsx               # Using BOTH libraries together
│   │   └── actions.ts             # Hybrid validation strategies
│   ├── logging/
│   │   ├── page.tsx               # suruk-logger interactive demo
│   │   └── actions.ts             # Logging feature tests
│   └── comparison/
│       └── page.tsx               # Side-by-side library comparison
├── config/                        # Configuration files
│   ├── default.json               # Base configuration
│   ├── development.json           # Dev overrides
│   ├── production.json            # Prod overrides
│   └── staging.json               # Staging overrides
├── lib/
│   ├── config.ts                  # turar-config setup
│   ├── formStore.ts               # ichchi-state form tracking
│   ├── formAdapter.ts             # sir-forms ↔ suruy adapter
│   ├── logger.ts                  # Server-side suruk-logger config
│   └── clientLogger.ts            # Client-side logging wrapper
└── env.ts                         # bylyt-env-guard configuration
```

## 🎨 Demo Pages

### 1. Home (`/`)
- Contact form with sir-forms
- Newsletter signup
- State persistence with ichchi-state
- Quick links to all demos

### 2. Configuration (`/config`)
- **turar-config v0.2.0 + bylyt-env-guard integration**
- Multi-format file loading (JSON, YAML, TOML)
- Environment cascading (default → NODE_ENV)
- Variable interpolation examples
- Environment variable health check
- Type-safe configuration access
- Hot reload demo (`/config/hotreload`) - Watch files and reload without restart

### 3. Advanced Features (`/features`)
- Computed values
- Time-travel debugging
- Optimistic updates
- Cross-tab synchronization
- Derived state
- State reset

### 4. suruy-form-actions (`/suruy`)
- **7 Complete Examples:**
  1. Built-in schema validator (contact form)
  2. Simple action (newsletter)
  3. File uploads with validation
  4. Complex registration (password rules)
  5. Dynamic array fields (tags)
  6. Zod integration (login)
  7. Advanced Zod (product form with refinements)

### 5. Hybrid Forms (`/hybrid`)
- **Using BOTH libraries together!**
- Profile form (suruy validation + sir-forms state)
- Checkout form (Zod + both libraries)
- Multi-step form (server validation per step)

### 6. Logging Showcase (`/logging`)
- Side-by-side code examples
- Feature matrix
- Bundle size comparison
- When to use which library

- **Interactive suruk-logger demo**
- Log levels (debug, info, warn, error, fatal)
- Structured logging with fields
- Child loggers with inherited context
- Automatic redaction (passwords, tokens, etc.)
- Error logging with stack traces
- Performance benchmarks
- Async logging examples
- Client-side logging wrapper

### 7. Library Comparison (`/comparison`)
- Side-by-side code examples
- Feature matrix
- Bundle size comparison
- When to use which library

## 🔄 Can They Work Together?

**YES!** The libraries are compatible via an adapter pattern.

### Quick Example

```typescript
// 1. Create action with suruy-form-actions
import { createFormAction, schema } from '@yedoma-labs/suruy-form-actions'

export const updateProfile = createFormAction(
  async (formData) => profileSchema.safeParse(formData),
  async (data) => { /* handler */ }
)

// 2. Use with sir-forms hooks via adapter
import { useFormSubmit } from '@yedoma-labs/sir-forms'
import { adaptSuruyActionForSirForms } from '@/lib/formAdapter'

const handleSubmit = useFormSubmit(
  adaptSuruyActionForSirForms(updateProfile),
  { onSuccess: (data) => console.log(data) }
)
```

**See `/hybrid` page for complete examples!**

## 📊 Library Comparison

| Feature | sir-forms | suruy-form-actions | Hybrid |
|---------|-----------|-------------------|--------|
| Bundle Size | ~8KB | ~3KB | ~11KB |
| Server Validation | ✅ | ✅ | ✅ |
| Client State | ✅ | ❌ | ✅ |
| Progressive Enhancement | ⚠️ Partial | ✅ Full | ✅ Full |
| Built-in Validator | ❌ | ✅ | ✅ |
| Controlled Inputs | ✅ | ❌ | ✅ |
| Field-level Hooks | ✅ | ❌ | ✅ |
| Auto-reset | ❌ | ✅ | ✅ |

## 🎯 When to Use What

### Use **sir-forms** when:
- Complex forms with client-side state
- Need controlled components
- Custom field hooks required
- Multi-step forms with client state

### Use **suruy-form-actions** when:
- Bundle size is critical
- Progressive enhancement required
- Simple to medium complexity
- Server-first validation preferred
- Want zero-config validator

### Use **BOTH (hybrid)** when:
- Complex forms needing both server security AND client UX
- Payment/checkout flows
- Multi-step forms with validation per step
- Forms with custom input formatting
- Need progressive enhancement + controlled components

### Use **ichchi-state** when:
- Need persistent client state
- Cross-tab synchronization required
- Computed/derived state
- State history/time-travel

### Use **turar-config** when:
- Complex multi-environment configuration needed
- Want file-based configuration (JSON, YAML, TOML)
- Need configuration cascading
- Variable interpolation required
- Secrets management integration needed

### Use **bylyt-env-guard** when:
- Simple environment variable validation needed
- Following 12-factor app principles
- Want zero file-based configuration
- Need minimal bundle size

### Use **suruk-logger** when:
- Need structured logging with TypeScript
- Want faster logging than Winston
- Need request context binding
- Want automatic field redaction (passwords, tokens, etc.)

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **React:** 19.2
- **TypeScript:** 5.9
- **Package Manager:** pnpm 9.12
- **Linting:** Biome

## 🌟 Key Features Demonstrated

### Forms
- ✅ Type-safe server actions
- ✅ Progressive enhancement
- ✅ File uploads
- ✅ Multi-step flows
- ✅ Built-in validation (zero deps)
- ✅ Zod integration
- ✅ Cross-field validation
- ✅ Dynamic array fields
- ✅ Custom validators

### State Management
- ✅ Persistent localStorage
- ✅ Cross-tab sync
- ✅ Computed values
- ✅ Optimistic updates
- ✅ Time-travel debugging
- ✅ Derived state

### Developer Experience
- ✅ Full TypeScript inference
- ✅ Runtime env validation
- ✅ Zero runtime dependencies (validators)
- ✅ Small bundle sizes
- ✅ React 19 native features
- ✅ Structured logging with automatic redaction

## 📖 Documentation

- **Live Demo:** [yedoma-labs-demo.vercel.app](https://yedoma-labs-demo.vercel.app)
- **Local:** Browse pages at http://localhost:3000
- **Library Comparison:** Visit `/comparison` page

## 🧪 Examples

### sir-forms Example

```typescript
'use client'
import { FormProvider, useField, useFormSubmit } from '@yedoma-labs/sir-forms'

function MyForm() {
  const emailField = useField('email')
  const handleSubmit = useFormSubmit(myAction)

  return (
    <form onSubmit={handleSubmit}>
      <input
        name={emailField.name}
        value={emailField.value ?? ''}
        onChange={emailField.onChange}
      />
      {emailField.error && <span>{emailField.error}</span>}
    </form>
  )
}
```

### suruy-form-actions Example

```typescript
// Server
'use server'
import { createFormAction, schema } from '@yedoma-labs/suruy-form-actions'

export const loginAction = createFormAction(
  async (formData) => loginSchema.safeParse(formData),
  async (data) => { /* handler */ }
)

// Client
'use client'
import { useFormAction } from '@yedoma-labs/suruy-form-actions'

function LoginForm() {
  const { state, action, pending } = useFormAction(loginAction)
  
  return (
    <form action={action}>
      <input name="email" disabled={pending} />
      {state.errors?.email && <span>{state.errors.email[0]}</span>}
    </form>
  )
}
```

### ichchi-state Example

```typescript
import { createAtom, useAtom } from '@yedoma-labs/ichchi-state'

const counterAtom = createAtom({
  key: 'counter',
  default: 0,
  persist: true, // Auto-save to localStorage
})

function Counter() {
  const [count, setCount] = useAtom(counterAtom)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### bylyt-env-guard Example

```typescript
import { createEnvGuard } from '@yedoma-labs/bylyt-env-guard'

export const env = createEnvGuard({
  NEXT_PUBLIC_API_URL: { required: true },
  DEMO_MODE: { required: false, default: 'true' },
})

// Type-safe access
console.log(env.NEXT_PUBLIC_API_URL) // ✅ Validated
```

### turar-config Example

```typescript
// lib/config.ts
import { createConfigSync } from '@yedoma-labs/turar-config'
import { eg } from '@yedoma-labs/bylyt-env-guard'
import path from 'node:path'

// Note: turar-config uses flat schema keys with underscores
// to map to nested JSON objects in config files
export const config = createConfigSync({
  schema: {
    app_name: eg.string().default('My App'),
    app_port: eg.number().default(3000),
    database_host: eg.string().default('localhost'),
    database_port: eg.number().default(5432),
  },
  configDir: path.join(process.cwd(), 'config'),
})

// Type-safe access (flat keys)
console.log(config.app_name) // ✅ string
console.log(config.database_port) // ✅ number
```

### suruk-logger Example

```typescript
// Server-side (lib/logger.ts)
import { createLogger } from '@yedoma-labs/suruk-logger'

export const logger = createLogger({
  name: 'my-app',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  pretty: process.env.NODE_ENV !== 'production',
  redact: ['password', 'cardNumber', 'cvv', 'token'],
})

// Create scoped loggers
export const actionLogger = logger.child({ module: 'actions' })

// In your server actions
'use server'
import { actionLogger } from '@/lib/logger'

export async function submitForm(data) {
  actionLogger.info('Form submitted', { 
    email: data.email,
    action: 'submitForm' 
  })
  // ...
}
```

## 🔗 Package Links

- [sir-forms on npm](https://www.npmjs.com/package/@yedoma-labs/sir-forms)
- [suruy-form-actions on npm](https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions)
- [ichchi-state on npm](https://www.npmjs.com/package/@yedoma-labs/ichchi-state)
- [turar-config on npm](https://www.npmjs.com/package/@yedoma-labs/turar-config)
- [bylyt-env-guard on npm](https://www.npmjs.com/package/@yedoma-labs/bylyt-env-guard)
- [suruk-logger on npm](https://www.npmjs.com/package/@yedoma-labs/suruk-logger)

## 📄 License

MIT

## 🤝 Contributing

This is a demo project showcasing Yedoma Labs packages. For package issues, please open issues on the respective package repositories.

---

**Built with ❤️ by Yedoma Labs**

*Demonstrating modern TypeScript patterns for Next.js applications*
