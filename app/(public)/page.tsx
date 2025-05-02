import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bell, LayoutGrid, MessageSquare } from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import { LandingHeader } from "@/components/landing-header";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center">
      <LandingHeader />
      <main className="flex-1 w-full flex flex-col items-center">
        {!!session?.user && (
          <div className="flex-grow flex items-center justify-center my-6">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  Bem-vindo de volta, {session.user.name}!
                </h2>
                <p className="text-gray-600">
                  Acompanhe seu progresso e gerencie suas tarefas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 flex justify-center">
          <div className="container px-4 md:px-6 flex justify-center">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Gerencie projetos com notificações via WhatsApp
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Organize suas tarefas com um quadro Kanban intuitivo e receba
                  notificações automáticas no WhatsApp quando o status das
                  tarefas mudar.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {!!session?.user ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="gap-2">
                        Ir para o dashboard <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/sign-in">
                      <Button size="lg" className="gap-2">
                        Começar agora <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Conhecer recursos
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-background shadow-xl dark:border-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 dark:opacity-30"></div>
                  <Image
                    src="/placeholder.svg?height=350&width=600"
                    alt="Dashboard Preview"
                    className="object-cover"
                    width={600}
                    height={350}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 flex justify-center"
        >
          <div className="container px-4 md:px-6 flex flex-col items-center">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Recursos principais
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Tudo o que você precisa para gerenciar seus projetos de forma
                  eficiente
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 ">
              <FeatureCard
                icon={<LayoutGrid className="h-8 w-8 text-blue-500" />}
                title="Quadros Kanban"
                description="Organize suas tarefas em quadros Kanban personalizáveis com colunas e cards arrastáveis."
              />
              <FeatureCard
                icon={<MessageSquare className="h-8 w-8 text-green-500" />}
                title="Integração WhatsApp"
                description="Receba notificações automáticas no WhatsApp quando o status das tarefas mudar."
              />
              <FeatureCard
                icon={<Bell className="h-8 w-8 text-purple-500" />}
                title="Notificações Personalizadas"
                description="Configure templates de mensagens e defina quando as notificações devem ser enviadas."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900 flex justify-center">
          <div className="container px-4 md:px-6 flex justify-center">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-4xl">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Pronto para começar?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Crie sua conta gratuitamente e comece a gerenciar seus
                  projetos com notificações via WhatsApp.
                </p>
              </div>
              <Link href="/sign-in">
                <Button size="lg" className="gap-2">
                  Criar conta gratuita <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
