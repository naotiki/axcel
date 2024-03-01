import { FC, PropsWithChildren } from "react";
import "@mantine/core/styles.css";
const Document: FC = (props: PropsWithChildren) => {
	return (
		<html lang="ja">
			<body>{props.children}</body>
		</html>
	);
};
