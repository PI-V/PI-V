"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

export function SignInButtons() {
  return (
    <div className="flex flex-col space-y-4">
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <Image
          src="/google-logo.svg"
          alt="Google Logo"
          width={20}
          height={20}
          className="mr-2"
        />
        Continuar com Google
      </Button>
    </div>
  );
}
