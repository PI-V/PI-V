"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface SignOutButtonProps {
  variant?: "default" | "dropdown";
  className?: string;
}

export function SignOutButton({ variant = "default", className }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (variant === "dropdown") {
    return (
      <DropdownMenuItem
        onClick={handleSignOut}
        className="cursor-pointer text-destructive focus:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </DropdownMenuItem>
    );
  }

  return (
    <Button 
      onClick={handleSignOut} 
      variant="destructive" 
      className={className || "w-full"}
    >
      Sair
    </Button>
  );
}
