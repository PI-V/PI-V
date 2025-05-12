"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ActivityLog = {
  id: string;
  userId: string;
  type:
    | "CARD_CREATED"
    | "CARD_UPDATED"
    | "CARD_DELETED"
    | "CARD_MOVED"
    | "COLUMN_CREATED"
    | "COLUMN_UPDATED"
    | "COLUMN_DELETED"
    | "BOARD_CREATED"
    | "BOARD_UPDATED"
    | "BOARD_DELETED"
    | "NOTIFICATION_SENT"
    | "NOTIFICATION_ERROR"
    | "ERROR"
    | "USER_LOGIN"
    | "USER_LOGOUT";
  description: string;
  cardId: string | null;
  columnId: string | null;
  boardId: string | null;
  metadata: {
    cardTitle: string;
    fromColumn: string;
    toColumn: string;
    boardTitle: string;
  } | null;
  createdAt: string;
};

export function ActivityLogList() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/activity-logs?limit=10");
      if (!response.ok) throw new Error("Falha ao carregar atividades");

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  function getActionIcon(activityLog: ActivityLog) {
    const { type } = activityLog;

    switch (type) {
      case "CARD_CREATED":
        return "✨";
      case "CARD_UPDATED":
        return "✏️";
      case "CARD_DELETED":
        return "🗑️";
      case "CARD_MOVED":
        return "🔄";
      case "NOTIFICATION_SENT":
        return "🧪";
      default:
        return "📝";
    }
  }

  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "agora mesmo";
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours}h`;

    // Formatar com data-fns para datas mais antigas
    return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades recentes</CardTitle>
          <CardDescription>Suas últimas ações no sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades recentes</CardTitle>
        <CardDescription>Suas últimas ações no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma atividade registrada ainda
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex gap-3 items-start">
                <div className="text-xs">{getActionIcon(activity)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {activity.metadata && (
                        <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded">
                          {activity.metadata.boardTitle}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
