"use client"

import { useState } from "react"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import { MoreHorizontal, Plus } from "lucide-react"

import type { ColumnType } from "./kanban-board"
import { KanbanCard } from "./kanban-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface KanbanColumnProps {
  column: ColumnType
  index: number
  addCard: (columnId: string, content: string, description?: string) => void
  updateCard: (columnId: string, cardId: string, content: string, description?: string) => void
  deleteCard: (columnId: string, cardId: string) => void
  updateColumnTitle: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
}

export function KanbanColumn({
  column,
  index,
  addCard,
  updateCard,
  deleteCard,
  updateColumnTitle,
  deleteColumn,
}: KanbanColumnProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false)
  const [newCardContent, setNewCardContent] = useState("")
  const [newCardDescription, setNewCardDescription] = useState("")
  const [columnTitle, setColumnTitle] = useState(column.title)

  const handleAddCard = () => {
    if (!newCardContent.trim()) return
    addCard(column.id, newCardContent, newCardDescription)
    setNewCardContent("")
    setNewCardDescription("")
    setIsAddCardOpen(false)
  }

  const handleUpdateColumn = () => {
    if (!columnTitle.trim()) return
    updateColumnTitle(column.id, columnTitle)
    setIsEditColumnOpen(false)
  }

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex flex-col bg-muted rounded-lg w-80 min-w-80 h-full"
        >
          <div
            {...provided.dragHandleProps}
            className="p-3 font-medium flex items-center justify-between bg-muted rounded-t-lg border-b"
          >
            <h3 className="text-sm font-medium">{column.title}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-sm">
                {column.cards.length}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditColumnOpen(true)}>Edit Column</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteColumn(column.id)}>
                    Delete Column
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Droppable droppableId={column.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-2 overflow-y-auto ${snapshot.isDraggingOver ? "bg-accent/50" : ""}`}
              >
                {column.cards.map((card, index) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    index={index}
                    columnId={column.id}
                    updateCard={updateCard}
                    deleteCard={deleteCard}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsAddCardOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </div>

          {/* Add Card Dialog */}
          <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Card</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Card Title</Label>
                  <Input
                    id="title"
                    value={newCardContent}
                    onChange={(e) => setNewCardContent(e.target.value)}
                    placeholder="Enter card title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newCardDescription}
                    onChange={(e) => setNewCardDescription(e.target.value)}
                    placeholder="Enter card description"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCard}>Add Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Column Dialog */}
          <Dialog open={isEditColumnOpen} onOpenChange={setIsEditColumnOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Column</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="columnTitle">Column Title</Label>
                  <Input id="columnTitle" value={columnTitle} onChange={(e) => setColumnTitle(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditColumnOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateColumn}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  )
}

