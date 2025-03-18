"use client"

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd"

import { KanbanColumn } from "./kanban-column"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

// Define types for our data structure
export type CardType = {
  id: string
  content: string
  description?: string
}

export type ColumnType = {
  id: string
  title: string
  cards: CardType[]
}

// Initial data for the board
const initialData: ColumnType[] = [
  {
    id: "column-1",
    title: "To Do",
    cards: [
      { id: "card-1", content: "Create project structure", description: "Set up Next.js with Tailwind CSS" },
      { id: "card-2", content: "Design UI components", description: "Create reusable components for the application" },
      { id: "card-3", content: "Implement drag and drop", description: "Add drag and drop functionality for cards" },
    ],
  },
  {
    id: "column-2",
    title: "In Progress",
    cards: [
      { id: "card-4", content: "Develop Kanban board", description: "Create the main Kanban board component" },
      { id: "card-5", content: "Add column management", description: "Implement adding and editing columns" },
    ],
  },
  {
    id: "column-3",
    title: "Done",
    cards: [{ id: "card-6", content: "Project setup", description: "Initialize the project repository" }],
  },
]

export function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("kanbanColumns")
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns))
    } else {
      setColumns(initialData)
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem("kanbanColumns", JSON.stringify(columns))
    }
  }, [columns])

  // Handle drag end event
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result

    // If there's no destination, do nothing
    if (!destination) return

    // If the item was dropped in the same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // If we're dragging columns
    if (type === "column") {
      const newColumnOrder = Array.from(columns)
      const movedColumn = newColumnOrder.splice(source.index, 1)[0]
      newColumnOrder.splice(destination.index, 0, movedColumn)
      setColumns(newColumnOrder)
      return
    }

    // Find the source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    // If moving within the same column
    if (sourceColumn.id === destColumn.id) {
      const newCards = Array.from(sourceColumn.cards)
      const movedCard = newCards.splice(source.index, 1)[0]
      newCards.splice(destination.index, 0, movedCard)

      const newColumn = {
        ...sourceColumn,
        cards: newCards,
      }

      setColumns(columns.map((col) => (col.id === newColumn.id ? newColumn : col)))
    } else {
      // Moving from one column to another
      const sourceCards = Array.from(sourceColumn.cards)
      const destCards = Array.from(destColumn.cards)
      const movedCard = sourceCards.splice(source.index, 1)[0]
      destCards.splice(destination.index, 0, movedCard)

      const newSourceColumn = {
        ...sourceColumn,
        cards: sourceCards,
      }

      const newDestColumn = {
        ...destColumn,
        cards: destCards,
      }

      setColumns(
        columns.map((col) => {
          if (col.id === newSourceColumn.id) return newSourceColumn
          if (col.id === newDestColumn.id) return newDestColumn
          return col
        }),
      )
    }
  }

  // Add a new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return

    const newColumn: ColumnType = {
      id: `column-${Date.now()}`,
      title: newColumnTitle,
      cards: [],
    }

    setColumns([...columns, newColumn])
    setNewColumnTitle("")
    setIsAddColumnOpen(false)
  }

  // Add a new card to a column
  const addCard = (columnId: string, content: string, description?: string) => {
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      content,
      description,
    }

    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, newCard],
          }
        }
        return col
      }),
    )
  }

  // Update a card
  const updateCard = (columnId: string, cardId: string, content: string, description?: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.map((card) => {
              if (card.id === cardId) {
                return { ...card, content, description }
              }
              return card
            }),
          }
        }
        return col
      }),
    )
  }

  // Delete a card
  const deleteCard = (columnId: string, cardId: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.filter((card) => card.id !== cardId),
          }
        }
        return col
      }),
    )
  }

  // Update a column title
  const updateColumnTitle = (columnId: string, title: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, title }
        }
        return col
      }),
    )
  }

  // Delete a column
  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter((col) => col.id !== columnId))
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddColumnOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Column
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div className="flex gap-4 h-full" {...provided.droppableProps} ref={provided.innerRef}>
                {columns.map((column, index) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    index={index}
                    addCard={addCard}
                    updateCard={updateCard}
                    deleteCard={deleteCard}
                    updateColumnTitle={updateColumnTitle}
                    deleteColumn={deleteColumn}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Column Title</Label>
              <Input
                id="title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddColumnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

