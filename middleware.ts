import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_INTERNAL = "/admin";
const ADMIN_PUBLIC = "/artcontrol";

function rewriteToInternal(request: NextRequest, pathname: string): NextResponse {
  const tail = pathname === ADMIN_PUBLIC ? "" : pathname.slice(ADMIN_PUBLIC.length);
  const internalPath = tail === "" || tail === "/" ? ADMIN_INTERNAL : `${ADMIN_INTERNAL}${tail.startsWith("/") ? tail : `/${tail}`}`;
  const url = request.nextUrl.clone();
  url.pathname = internalPath;
  return NextResponse.rewrite(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* روابط قديمة /admin → /artcontrol */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const tail = pathname === "/admin" ? "" : pathname.slice("/admin".length);
    const url = request.nextUrl.clone();
    url.pathname = tail ? `${ADMIN_PUBLIC}${tail.startsWith("/") ? tail : `/${tail}`}` : ADMIN_PUBLIC;
    return NextResponse.redirect(url, 308);
  }

  const isArtcontrol = pathname === ADMIN_PUBLIC || pathname.startsWith(`${ADMIN_PUBLIC}/`);
  const isApiAdmin = pathname.startsWith("/api/admin");

  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (pathname === `${ADMIN_PUBLIC}/login`) {
    return rewriteToInternal(request, pathname);
  }

  if (isArtcontrol || isApiAdmin) {
    const session = request.cookies.get("admin_session")?.value;
    if (!session) {
      if (isApiAdmin) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
      }
      const login = request.nextUrl.clone();
      login.pathname = `${ADMIN_PUBLIC}/login`;
      return NextResponse.redirect(login);
    }

    const parts = session.split(":");
    if (parts.length !== 3) {
      if (isApiAdmin) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
      }
      const login = request.nextUrl.clone();
      login.pathname = `${ADMIN_PUBLIC}/login`;
      return NextResponse.redirect(login);
    }

    const expires = parseInt(parts[1], 10);
    if (Date.now() > expires) {
      const response = isApiAdmin
        ? NextResponse.json({ error: "انتهت الجلسة" }, { status: 401 })
        : NextResponse.redirect(new URL(`${ADMIN_PUBLIC}/login`, request.url));
      response.cookies.delete("admin_session");
      return response;
    }

    if (isArtcontrol) {
      return rewriteToInternal(request, pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/artcontrol", "/artcontrol/:path*", "/api/admin/:path*"],
};
