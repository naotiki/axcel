import type { ReactAuthProvider, User } from "@/auth/AuthProvider";
import { useSession, signIn, signOut, SessionProvider } from "@hono/auth-js/react";
import type { FC, ReactNode } from "react";

export class ReactAuthJsKeycloakProvider implements  ReactAuthProvider {
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
  AuthContextProvider: FC<{ children: ReactNode; }> = SessionProvider;
}