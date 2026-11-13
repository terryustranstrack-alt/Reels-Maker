import { NextResponse, type NextRequest } from "next/server";

// When this app runs online on Vercel, it is only the AI service: every page and every
// /api/local route (which need the PC) is hidden. The Windows app is unaffected.
export function proxy(request: NextRequest) {
  const isOnlineService = process.env.VERCEL === "1";
  if (isOnlineService && !request.nextUrl.pathname.startsWith("/api/cloud/")) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.next();
}
