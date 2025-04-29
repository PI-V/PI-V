"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

export function SignInButtons() {
  return (
    <div className="flex flex-col space-y-4">
      <Button
        variant="outline"
        className="flex items-center justify-center gap-2 w-full py-6 border-gray-300 hover:bg-gray-50"
        onClick={() => signIn("google", { callbackUrl: "/profile" })}
      >
        <Image
          src="/google-logo.svg"
          alt="Google Logo"
          width={20}
          height={20}
        />
        <span>Continuar com Google</span>
      </Button>
    </div>
  );
}