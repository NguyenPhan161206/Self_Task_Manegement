import { ClipboardList } from 'lucide-react'

export function TaskEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">Chưa có nhiệm vụ nào</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tạo nhiệm vụ đầu tiên để bắt đầu.
      </p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          Tạo nhiệm vụ đầu tiên
        </button>
      )}
    </div>
  )
}
