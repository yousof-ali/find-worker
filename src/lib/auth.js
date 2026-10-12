import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const signToken = (payload, expiresIn = "7d") =>
  new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiresIn).sign(secret);

export async function getSession() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret)).payload;
  } catch {
    return null;
  }
}

export const setAuthCookie = (res, token, maxAge = 60 * 60 * 24 * 7) =>
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });