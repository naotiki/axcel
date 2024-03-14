import { Anchor, AnchorProps } from "@mantine/core";
import { AnyRoute, Link, LinkProps, RegisteredRouter, RoutePaths } from "@tanstack/react-router";

export function RouteAnchor<
	TRouteTree extends AnyRoute = RegisteredRouter["routeTree"],
	TFrom extends RoutePaths<TRouteTree> | string = string,
	TTo extends string = "",
	TMaskFrom extends RoutePaths<TRouteTree> | string = TFrom,
	TMaskTo extends string = "",
>(params: AnchorProps & LinkProps<TRouteTree, TFrom, TTo, TMaskFrom, TMaskTo>) {
	return <Anchor component={Link} {...params} />;
}
