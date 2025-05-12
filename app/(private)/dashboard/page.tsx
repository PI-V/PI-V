import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityLogList } from "@/components/activity-log-list";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch user's boards
  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seus Quadros</h1>
        <Link href="/dashboard/boards/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Quadro
          </Button>
        </Link>
      </div>

      {boards.length === 0 ? (
        <div className="text-center p-12 bg-muted rounded-lg">
          <h2 className="text-2xl font-medium mb-4">
            Você não tem quadros ainda
          </h2>
          <p className="text-muted-foreground mb-6">
            Crie seu primeiro quadro para começar a organizar suas tarefas
          </p>
          <Link href="/dashboard/boards/new">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar meu primeiro quadro
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link href={`/dashboard/boards/${board.id}`} key={board.id}>
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>{board.title}</CardTitle>
                  {board.description && (
                    <CardDescription>{board.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Criado em{" "}
                    {new Date(board.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full">
                    Abrir quadro
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Activity Log Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Atividades Recentes</h2>
        <ActivityLogList />
      </div>
    </div>
  );
}
