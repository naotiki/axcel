import { MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { SessionProvider } from "@hono/auth-js/react";
import { UserProvider } from "./front/components/UserProvider";
import { ContextMenuProvider } from "./front/components/ContextMenuProvider";
// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
function App() {
	return (
		<>
			<SessionProvider>
				<MantineProvider>
					<UserProvider>
						<ContextMenuProvider>
							<RouterProvider router={router} />
						</ContextMenuProvider>
					</UserProvider>
				</MantineProvider>
			</SessionProvider>
		</>
	);
}

// biome-ignore lint/style/noNonNullAssertion: rootがないと何も始まらないため。
const domNode = document.getElementById("app")!;

const root = createRoot(domNode);
root.render(<App />);
