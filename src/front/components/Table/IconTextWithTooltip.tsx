import { Tooltip, Stack, Center } from "@mantine/core";
type IconTextWithTooltipProps = { icon: React.ReactNode; text: string; tooltip: string; color?: string };
export function IconTextWithTooltip({ icon, text, tooltip, color }: IconTextWithTooltipProps) {
	return (
		<Tooltip label={tooltip}>
			<Center c={color}>
				{icon}
				{text}
			</Center>
		</Tooltip>
	);
}
