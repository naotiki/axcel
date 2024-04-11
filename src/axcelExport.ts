import axcel from "@/example.schema"
import type { AuthProvider } from "./auth/AuthProvider"
import { AuthJsKeycloakProvider } from "./auth/providers/AuthJsKeycloakProvider"
import { MockProvider } from "./auth/providers/MockProvider"
export const authProvider: AuthProvider = new MockProvider()
export { axcel }