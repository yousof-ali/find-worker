import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export function withAuth(handler, roles = []) {
  return async (req, ctx) => {
    // cookie theke, na thakle Authorization: Bearer <token> theke
    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token)
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });

    let user;
    try {
      user = (await jwtVerify(token, secret)).payload; // { id, role, name }
    } catch {
      return NextResponse.json({ message: "Unauthorized: token invalid ba expired" }, { status: 401 });
    }

    if (roles.length && !roles.includes(user.role))
      return NextResponse.json({ message: "Forbidden: No access" }, { status: 403 });

    // handler er 3rd argument e logged in user pabe
    return handler(req, ctx, user);
  };
}