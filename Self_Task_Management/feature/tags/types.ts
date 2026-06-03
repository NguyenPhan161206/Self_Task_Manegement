import type { Database } from '@/types/database'

export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']

// DB trigger sử dụng public.get_max_tags_per_user() làm single source of truth
// Hằng số này đồng bộ với trigger để UX feedback nhanh, không cần đợi DB error
export const MAX_TAGS_PER_USER = 10
