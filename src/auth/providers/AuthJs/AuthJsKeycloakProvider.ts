import type { HonoAuthProvider } from "../../AuthProvider";
import type { MiddlewareHandler } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import Keycloak from "@auth/core/providers/keycloak";


export class AuthJsKeycloakProvider implements HonoAuthProvider {
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

}
