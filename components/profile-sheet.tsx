"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { User } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import { useRouter } from "next/navigation";

interface ProfileSheetProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  trigger?: React.ReactNode;
}

const ProfileSheetComponent = ({ user, trigger }: ProfileSheetProps) => {
  const router = useRouter();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Seu Perfil</SheetTitle>
          <SheetDescription>
            Informações sobre seu perfil de usuário.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {user.image && (
            <div className="flex justify-center py-2">
              <Image
                src={user.image}
                alt="Foto de perfil"
                width={96}
                height={96}
                className="rounded-full"
                priority
                loading="eager"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="font-medium text-sm">Nome</div>
              <div className="text-base bg-muted/50 p-2 rounded-md">
                {user.name || "Não informado"}
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="font-medium text-sm">Email</div>
              <div className="text-base bg-muted/50 p-2 rounded-md">
                {user.email || "Não informado"}
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          <div className="flex flex-col w-full space-y-2">
            <SignOutButton variant="default" className="w-full" />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export const ProfileSheet = memo(ProfileSheetComponent);
