import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) => {
  return handlers.GET(request);
};

export const POST = (request: NextRequest) => {
  return handlers.POST(request);
};