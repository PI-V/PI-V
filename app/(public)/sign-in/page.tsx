import { SignInButtons } from "@/components/sign-in-buttons";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <div className="inline-block mb-4">
              <Image src="/next.svg" alt="Logo" width={120} height={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo</h1>
            <p className="text-gray-600">Faça login para acessar sua conta</p>
          </div>

          <div className="mt-8">
            <SignInButtons />

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Voltar para a página inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
