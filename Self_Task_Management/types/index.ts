// Global / shared type exports
// Prefer importing specific features first: import type { Task } from '@/feature/tasks'

// Re-export database types so the whole app can do `import type { Database } from '@/types'`
export type { Database, Json } from './database'
