import type { ReactNode } from "@tanstack/react-router";
import type { Context } from "hono";
import type { MiddlewareHandler } from "hono/types";
import { PropsWithChildren } from "react";

export interface AuthProvider {
  initMiddleware(): MiddlewareHandler;
  verifyAuthMiddleware(): MiddlewareHandler;
  authHandlerMiddleware(): MiddlewareHandler;
  signIn(): void;
  signOut(arg:{callbackUrl:string}): void;
  useUserBySession(): {user:User | null,status:"unauthenticated" | "authenticated" | "loading"};
  AuthContextProvider: React.FC<{ children: ReactNode }>;
}

export interface User {
  id: string
  name: string | null
  email?: string | null
  image?: string | null
}