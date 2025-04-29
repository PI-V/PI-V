import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session && request.nextUrl.pathname.startsWith("/(private)")) {
    return Response.redirect(new URL("/sign-in", request.url));
  }

  return;
}

export const config = {
  matcher: ["/(private)/:path*"]
};
