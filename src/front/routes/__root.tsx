import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Layout } from "../layouts/DefaultLayout";
import React from "react";

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
const TanStackRouterDevtools = import.meta.env.PROD
	? () => null // Render nothing in production
	: React.lazy(() =>
			// Lazy load in development
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
				// For Embedded Mode
				// default: res.TanStackRouterDevtoolsPanel
			})),
	  );
