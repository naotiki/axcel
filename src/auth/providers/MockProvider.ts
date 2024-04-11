import type { FC, ReactNode } from "react";
import type { AuthProvider, User } from "../AuthProvider";
import type { Context, MiddlewareHandler } from "hono";
import React from "react";
import { v4 as uuid } from "uuid";

const emptyMiddleware: MiddlewareHandler = async (_ctx,next) => { await next() }

export class MockProvider implements AuthProvider {
  user: User | null = null
  useUserBySession(): { user: User | null; status: "unauthenticated" | "authenticated" | "loading"; } {
    return { user: this.user, status: this.user ? "authenticated" : "unauthenticated"};
  }
  signIn(): void {
    this.user = { id: uuid(), name: `${uuid()}` }
  }
  signOut(option: { callbackUrl?: string; }): void {
    this.user = null;
    location.reload()
  }
  initMiddleware(): MiddlewareHandler {
    return emptyMiddleware
  }
  verifyAuthMiddleware(): MiddlewareHandler {
    return emptyMiddleware
  }
  authHandlerMiddleware(): MiddlewareHandler {
    return emptyMiddleware
  }

  AuthContextProvider: FC<{ children: ReactNode; }> = React.Fragment;

}
