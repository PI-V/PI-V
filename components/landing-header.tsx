import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { auth } from "@/lib/auth";

export async function LandingHeader() {
  const session = await auth();
  return (
    <header className="w-full border-b bg-background flex justify-center">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">KanbanApp</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {session?.user ? (
            <Link href="/dashboard">
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
                Ir para dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/sign-in">
              <Button>Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
