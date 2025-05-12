import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrivateHeader } from "@/components/private-header";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <>
      <PrivateHeader user={session.user} />
      <main className="h-[calc(100vh-4rem)] overflow-y-auto">{children}</main>
    </>
  );
}
