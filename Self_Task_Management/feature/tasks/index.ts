// Public entry point for the tasks feature
// Other code should import from here when possible:
//   import { TaskList, useTasks, createTask } from '@/feature/tasks'

export * from './types'
export * from './utils'

// Components (add exports as you create them)
// export { TaskCard, TaskForm, TaskList, TaskFilters } from './components'

// Hooks
// export { useTasks, useTaskFilters } from './hooks'

// Server actions (safe to import in forms / client components that call them via action prop)
export * from './actions'

// Data access (lib) - prefer importing specific
// export { getTasks, subscribeToTasks } from './lib/queries'
