import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Validar variáveis de ambiente essenciais
export function validateEnv() {
  const requiredEnvVars = [
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "WHATSAPP_API_URL",
    "FB_TOKEN",
    "WEBHOOK_VERIFY_TOKEN",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.warn(
      `Atenção: As seguintes variáveis de ambiente estão faltando: ${missingEnvVars.join(
        ", "
      )}`
    );
    return false;
  }

  return true;
}
