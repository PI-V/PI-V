"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

export function SignInButtons() {
  return (
    <div className="flex flex-col space-y-4">
      <Button
        variant="outline"
        className="flex items-center justify-center gap-2 w-full py-6 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <Image
          src="/google-logo.svg"
          alt="Google Logo"
          width={20}
          height={20}
        />
        <span className="dark:text-white">Continuar com Google</span>
      </Button>
    </div>
  );
}
