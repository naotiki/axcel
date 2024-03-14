import { css } from "@emotion/css";
import { Popover, Box,Text } from "@mantine/core";
import React from "react";

type ErrorMakerProps = {
	errors?: string[];
	opened: boolean;
};
export const ErrorMaker = React.memo<ErrorMakerProps>(({ errors, opened }: ErrorMakerProps) => {
	if (errors?.length === 0 || !errors) return <></>;
	return (
		<div
			className={css({
				position: "relative",
			})}
		>
			<Popover opened={opened} position="top" withArrow arrowSize={12}>
				<Popover.Target>
					<div
						className={css({
							position: "absolute",
							top: 0,
							width: "0.5rem",
							height: "0.5rem",
							borderTop: "0.5rem solid red",
							borderRight: "0.5rem solid transparent",
						})}
					/>
				</Popover.Target>
				<Popover.Dropdown>
					<Box
						style={{
							maxHeight: "2rem",
							overflowY: "scroll",
							scrollbarWidth: "none",
						}}
					>
						{errors.map((e) => (
							<Text key={e}>{e}</Text>
						))}
					</Box>
				</Popover.Dropdown>
			</Popover>
		</div>
	);
});