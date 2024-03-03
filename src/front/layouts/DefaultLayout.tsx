import { FC, PropsWithChildren } from "react";
import "@mantine/core/styles.css";
import { Header } from "../components/Header";
export const Layout: FC<PropsWithChildren> = (props: PropsWithChildren) => {
	return (
		<>
			<Header />
			{props.children}
		</>
	);
};
