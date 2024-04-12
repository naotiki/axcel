import type { ReactAuthProvider } from "./auth/AuthProvider";
import { ReactAuthJsKeycloakProvider } from "./auth/providers/AuthJs/ReactAuthJsKeycloakProvider";
import { MockProvider } from "./auth/providers/MockProvider";

export const authProvider: ReactAuthProvider = import.meta.env.VITE_AUTH_PROVIDER === "Mock" ? new MockProvider() : new ReactAuthJsKeycloakProvider()