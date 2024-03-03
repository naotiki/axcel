import { Button, Container, Flex, Space, Title } from "@mantine/core";

export function Header() {
	return (
		<header>
			<Container size="md" py={20}>
				<Flex gap={10} align={"center"}>
					<Title order={1}> No Excel!</Title>
          <Space style={{flexGrow:1}}/>
					<Button>ログイン</Button>
				</Flex>
			</Container>
		</header>
	);
}
