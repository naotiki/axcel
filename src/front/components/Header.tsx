import { Button, Container, Flex, Space, Title, Text, Avatar, Group } from "@mantine/core";
import { useUser } from "./UserProvider";
import { RouteAnchor } from "./RouteAnchor";
import { authProvider } from "@/axcelExport";

export function Header() {
	const user = useUser();
	return (
		<header>
			<Container size="lg" py={20}>
				<Group gap={10} align={"center"}>
					<RouteAnchor
						to="/"
						variant="gradient"
						underline="never"
						gradient={{ from: "red", to: "orange", deg: 0 }}
					>
						<Title order={1} > Axcel</Title>
					</RouteAnchor>
					<Space style={{ flexGrow: 1 }} />
					<Avatar size="lg">
						{user.name
							?.split(" ")
							.map((s) => s[0])
							.join("")}
					</Avatar>
					<Text>{user.name}</Text>
					<Button
						variant="outline"
						onClick={() => {
							authProvider.signOut({ callbackUrl: `/api/auth/signin?callbackUrl=${location.href}` });
						}}
						color="red"
					>
						ログアウト
					</Button>
				</Group>
			</Container>
		</header>
	);
}
