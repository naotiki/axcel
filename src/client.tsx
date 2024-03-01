import { Button, MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
function App() {
	return (
		<>
			<MantineProvider>
				<h1>Hello, Hono with React!</h1>
				<h2>Example of useState()</h2>
				<h2>Example of API fstch()</h2>
                <Button variant="filled">Button</Button>
			</MantineProvider>
		</>
	);
}

// biome-ignore lint/style/noNonNullAssertion: rootがないと何も始まらないため。
const domNode = document.getElementById("root")!;

const root = createRoot(domNode);
root.render(<App />);
