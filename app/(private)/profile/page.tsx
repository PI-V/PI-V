import { redirect } from "next/navigation";

// Redireciona para o dashboard já que agora usamos o Sheet para exibir o perfil
export default function Profile() {
  redirect("/dashboard");
}
