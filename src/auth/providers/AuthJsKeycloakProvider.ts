import type { FC, ReactNode } from "react";
import type { AuthProvider, User } from "../AuthProvider";
import { SessionProvider, signIn, signOut, useSession } from "@hono/auth-js/react";
import type { MiddlewareHandler } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import Keycloak from "@auth/core/providers/keycloak";


export class AuthJsKeycloakProvider implements AuthProvider {
  useUserBySession(): { user: User | null; status: "unauthenticated" | "authenticated" | "loading"; } {
    const { data: session, status } = useSession();
    return { user: (session?.user ?? null) as User | null, status };
  }
  signIn(): void {
    signIn("keycloak");
  }
  signOut(option: { callbackUrl: string; }): void {
    signOut(option);
  }
  initMiddleware(): MiddlewareHandler {
    return initAuthConfig((c) => {
      c.res.headers.set("x-forwarded-host", process.env.AUTH_URL ?? "");
      //c.res.headers["x-forwarded-host"] = process.env.AUTH_URL
      return {
        secret: process.env.AUTH_SECRET,
        providers: [
          Keycloak({
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_SECRET,
            issuer: process.env.KEYCLOAK_ISSUER,
          }),
        ],
      };
    });
  }
  verifyAuthMiddleware(): MiddlewareHandler {
    return verifyAuth();
  }
  authHandlerMiddleware(): MiddlewareHandler {
    return authHandler();
  }
  AuthContextProvider: FC<{ children: ReactNode; }> = SessionProvider;

}
