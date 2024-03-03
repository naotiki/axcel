import { MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Top } from "./front/pages/Top";
import { Layout } from "./front/layouts/DefaultLayout";
function App() {
	return (
		<>
			<MantineProvider>
				<Layout>
					<Top />
				</Layout>
			</MantineProvider>
		</>
	);
}

// biome-ignore lint/style/noNonNullAssertion: rootがないと何も始まらないため。
const domNode = document.getElementById("root")!;

const root = createRoot(domNode);
root.render(<App />);
