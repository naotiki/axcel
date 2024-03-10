import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Layout } from "../layouts/DefaultLayout";

export const Route = createRootRoute({
	component: () => (
		<>
			<Layout>
				<Outlet />
			</Layout>
			<TanStackRouterDevtools />
		</>
	),
});
