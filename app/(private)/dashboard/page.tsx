import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col w-full justify-center">
      <h1>Dashboard</h1>
    </div>
  );
}
