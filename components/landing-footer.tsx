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
