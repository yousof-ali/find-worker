import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// --------------------------------------------------
// Route config
// --------------------------------------------------

const GUEST_ONLY = ["/login", "/signup"];

const ADMIN_ONLY = ["/admin", "/api/admin"];

const WORKER_ONLY = ["/worker", "/api/worker"];

const USER_ONLY = ["/user", "/api/user"];

const ANY_LOGGED_IN = ["/profile", "/settings"];

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const matches = (path, list) =>
  list.some(
    (base) => path === base || path.startsWith(base + "/")
  );

// --------------------------------------------------
// Middleware
// --------------------------------------------------

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");
  const isGuestOnly = matches(pathname, GUEST_ONLY);
  const needsAdmin = matches(pathname, ADMIN_ONLY);
  const needsWorker = matches(pathname, WORKER_ONLY);
  const needsUser = matches(pathname, USER_ONLY);
  const needsLogin =
    needsAdmin ||
    needsWorker ||
    needsUser ||
    matches(pathname, ANY_LOGGED_IN);

  if (!isGuestOnly && !needsLogin) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  let user = null;

  // --------------------------------------------------
  // Verify JWT
  // --------------------------------------------------

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);

      user = {
        id: payload.id,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
    } catch {
      user = null;
    }
  }

  // --------------------------------------------------
  // Dashboard based on role
  // --------------------------------------------------

  const getDashboard = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/dashboard";

      case "worker":
        return "/worker/dashboard";

      case "user":
        return "/";

      default:
        return "/login";
    }
  };

  const redirect = (to) =>
    NextResponse.redirect(new URL(to, req.url));

  const json = (message, status) =>
    NextResponse.json({ message }, { status });

  // --------------------------------------------------
  // Route checks
  // --------------------------------------------------

  // --------------------------------------------------
  // 1. Guest-only routes
  // --------------------------------------------------

  if (isGuestOnly) {
    return user
      ? redirect(getDashboard())
      : NextResponse.next();
  }

  // --------------------------------------------------
  // 2. Public routes
  // --------------------------------------------------

  if (!needsLogin) {
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 3. Login required but no token
  // --------------------------------------------------

  if (!user) {
    return isApi
      ? json("Unauthorized", 401)
      : redirect("/login");
  }

  if (!isApi && needsUser && user.role === "user") {
    return redirect("/");
  }

  // --------------------------------------------------
  // 4. Admin-only
  // --------------------------------------------------

  if (needsAdmin && user.role !== "admin") {
    return isApi
      ? json("Forbidden", 403)
      : redirect("/forbidden");
  }

  // --------------------------------------------------
  // 5. Worker-only
  // --------------------------------------------------

  if (needsWorker && user.role !== "worker") {
    return isApi
      ? json("Forbidden", 403)
      : redirect("/forbidden");
  }

  // --------------------------------------------------
  // 6. User-only
  // --------------------------------------------------

  if (needsUser && user.role !== "user") {
    return isApi
      ? json("Forbidden", 403)
      : redirect("/forbidden");
  }

  // --------------------------------------------------
  // 7. Access granted
  // --------------------------------------------------

  return NextResponse.next();
}

// --------------------------------------------------
// Matcher
// --------------------------------------------------

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};