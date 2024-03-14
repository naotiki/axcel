import { css } from "@emotion/css";
import { Tooltip } from "@mantine/core";
import React from "react";

type EditingBadgesProps = {
	users: {
		name: string;
		color: string;
	}[];
};
export function EditingBadges(props: EditingBadgesProps) {
	if (props.users.length === 0) return <></>;
	return (
		<Tooltip.Floating label={`${props.users.map((u) => u.name).join(",")}`}>
			<div
				className={css({
					position: "relative",
				})}
			>
				{props.users.map((u, i) => (
					<div
						key={`${u.name}-${i}`}
						className={css({
							position: "absolute",
							right: `${(i * 0.25).toString()}rem`,
							width: "0.5rem",
							height: "0.5rem",
							background: u.color,
							borderRadius: "50%",
						})} />
				))}
			</div>
		</Tooltip.Floating>
	);
}
