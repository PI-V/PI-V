import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <main className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        {session?.user ? (
          <Link href="/profile">
            <Button variant="outline" className="flex items-center gap-2">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              Meu Perfil
            </Button>
          </Link>
        ) : (
          <Link href="/sign-in">
            <Button>Entrar</Button>
          </Link>
        )}
      </div>

      <div className="flex-grow flex items-center justify-center">
        {session?.user ? (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                Bem-vindo de volta, {session.user.name}!
              </h2>
              <p className="text-gray-600">
                Acompanhe seu progresso e gerencie suas tarefas.
              </p>
            </div>

            <Link href="/profile">
              <Button size="lg" className="px-8 py-6 text-lg">
                Ir para meu perfil
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                Bem-vindo ao Kanban Board
              </h2>
              <p className="text-gray-600">
                Faça login para começar a gerenciar suas tarefas.
              </p>
            </div>

            <Link href="/sign-in">
              <Button size="lg" className="px-8 py-6 text-lg">
                Fazer login
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* <KanbanBoard /> */}
    </main>
  );
}
