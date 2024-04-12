import type { MiddlewareHandler } from "hono/types";
import type { PropsWithChildren } from "react";

export interface HonoAuthProvider {
  initMiddleware(): MiddlewareHandler;
  verifyAuthMiddleware(): MiddlewareHandler;
  authHandlerMiddleware(): MiddlewareHandler;
}

export interface ReactAuthProvider {
  signIn(): void;
  signOut(arg:{callbackUrl:string}): void;
  useUserBySession(): {user:User | null,status:"unauthenticated" | "authenticated" | "loading"};
  AuthContextProvider: React.FC<Required<PropsWithChildren>>;
}

export interface User {
  id: string
  name: string | null
  email?: string | null
  image?: string | null
}