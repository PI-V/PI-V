import { KanbanBoard } from "@/components/kanban-board"

export default function Home() {
  return (
    <main className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
      </div>
      <KanbanBoard />
    </main>
  )
}

