import { Button, Container, Flex, Space, Title ,Text, Avatar} from "@mantine/core";
import { useUser } from "./UserProvider";
import { signOut } from "@hono/auth-js/react";

export function Header() {
	const user=useUser()
	return (
		<header>
			<Container size="md" py={20}>
				<Flex gap={10} align={"center"}>
					<Title order={1}> Axcel</Title>
          <Space style={{flexGrow:1}}/>
					<Avatar size="lg">{user.name?.split(" ").map(s=>s[0]).join("")}</Avatar>
					<Text>{user.name}</Text>
					<Button variant="outline" onClick={()=>{
						signOut()
					}}>ログアウト</Button>
				</Flex>
			</Container>
		</header>
	);
}
