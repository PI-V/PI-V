import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Profile() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <main className="container mx-auto p-4 h-screen flex flex-col no-scrollbar overflow-y-auto">
      <div className="max-w-md w-full mx-auto mt-10 p-6 bg-muted/80 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Seu Perfil</h1>

        <div className="space-y-4">
          {session.user.image && (
            <div className="flex justify-center">
              <Image
                src={session.user.image}
                alt="Foto de perfil"
                width={96}
                height={96}
                className="rounded-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <p>
              <strong>Nome:</strong> {session.user.name}
            </p>
            <p>
              <strong>Email:</strong> {session.user.email}
            </p>
          </div>

          <div className="pt-4 flex flex-col space-y-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Voltar para Home
              </Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
