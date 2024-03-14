import {
	Checkbox, Group,
	Menu,
	ActionIcon,
	rem
} from "@mantine/core";
import { RowChangeType } from "../../repo/TableChangesRepository";
import { IconCaretDownFilled, IconTrash } from "@tabler/icons-react";
import React from "react";
import { actionCell } from "./AxcelTable";

type ActionCellProps = {
	selected: boolean;
	changed: RowChangeType | null;
	onChange: (v: boolean) => void;
	onRowDelete: () => void;
	onRowRecover?: () => void;
};
export function ActionCell(props: ActionCellProps) {
	return (
		<td className={actionCell}>
			<Group gap={1}>
				<Checkbox
					checked={props.selected}
					onChange={(e) => {
						props.onChange(e.currentTarget.checked);
					}} />
				<Menu shadow="md">
					<Menu.Target>
						<ActionIcon variant="subtle" size={"sm"}>
							<IconCaretDownFilled style={{ width: "70%", height: "70%" }} stroke={1.5} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>行の操作</Menu.Label>
						{props.changed === "delete" ? (
							<Menu.Item onClick={() => props?.onRowRecover?.()}>行の削除をやめる</Menu.Item>
						) : (
							<Menu.Item
								color="red"
								leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
								onClick={() => props.onRowDelete()}
							>
								行の削除
							</Menu.Item>
						)}
					</Menu.Dropdown>
				</Menu>
			</Group>
		</td>
	);
}
