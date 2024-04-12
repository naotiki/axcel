import type { HonoAuthProvider } from "./auth/AuthProvider";
import { AuthJsKeycloakProvider } from "./auth/providers/AuthJs/AuthJsKeycloakProvider";
import { MockProvider } from "./auth/providers/MockProvider";

export const authProvider: HonoAuthProvider = import.meta.env.VITE_AUTH_PROVIDER === "Mock" ? new MockProvider() : new AuthJsKeycloakProvider()