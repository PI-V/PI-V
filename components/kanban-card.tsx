"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { MoreHorizontal } from "lucide-react"

import type { CardType } from "./kanban-board"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface KanbanCardProps {
  card: CardType
  index: number
  columnId: string
  updateCard: (columnId: string, cardId: string, content: string, description?: string) => void
  deleteCard: (columnId: string, cardId: string) => void
}

export function KanbanCard({ card, index, columnId, updateCard, deleteCard }: KanbanCardProps) {
  const [isEditCardOpen, setIsEditCardOpen] = useState(false)
  const [cardContent, setCardContent] = useState(card.content)
  const [cardDescription, setCardDescription] = useState(card.description || "")

  const handleUpdateCard = () => {
    if (!cardContent.trim()) return
    updateCard(columnId, card.id, cardContent, cardDescription)
    setIsEditCardOpen(false)
  }

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-2 ${snapshot.isDragging ? "opacity-70" : ""}`}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">{card.content}</p>
                  {card.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditCardOpen(true)}>Edit Card</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteCard(columnId, card.id)}>
                      Delete Card
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>

      {/* Edit Card Dialog */}
      <Dialog open={isEditCardOpen} onOpenChange={setIsEditCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cardTitle">Card Title</Label>
              <Input id="cardTitle" value={cardContent} onChange={(e) => setCardContent(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cardDescription">Description (optional)</Label>
              <Textarea
                id="cardDescription"
                value={cardDescription}
                onChange={(e) => setCardDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCardOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

