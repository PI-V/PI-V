import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="w-full border-t bg-background py-6 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">KanbanApp</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerencie projetos com notificações via WhatsApp
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    Preços
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Suporte</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    Contato
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} KanbanApp. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
