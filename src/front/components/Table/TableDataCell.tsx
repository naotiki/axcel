import { useEffect, useState } from "react";
import { css } from "@emotion/css";
import {
	Text,
	Paper,
	Button,
	Divider,
	Stack
} from "@mantine/core";
import { AbsoluteCellPosition } from "./TableDevTest";
import { GuardField } from "../../../library/guard/guard";
import { CellChangeType } from "../../repo/TableChangesRepository";
import { GuardValue } from "../../../library/guard/GuardValue";
import { useContextMenu } from "../ContextMenuProvider";
import { useClipboard } from "@mantine/hooks";
import { GuardModelBase } from "@/library/guard/GuardModel";
import React from "react";
import { GuardFieldInput } from "./GuardFieldInput";
import { GuardFieldDisplay } from "./GuardFieldDisplay";
import { EditingBadges } from "./EditingBadges";
import { focusedDataCell, dataCell, changedCell } from "./TableProvider";
import { ErrorMaker } from "./ErrorMarker";

type TableDataCellProps<M extends GuardModelBase> = {
	value: string | null | undefined;
	field: GuardField;
	loc: AbsoluteCellPosition<M>;
	changed: CellChangeType | null;
	selected?: string;
	selectingUsers: {
		name: string;
		color: string;
	}[];
	onValueChanged: (v: string | null | undefined, old: string | null | undefined) => void;
	onValueReset: () => void;
	onSelected: (l: AbsoluteCellPosition<M>) => void;
};
export function TableDataCell<M extends GuardModelBase>(props: TableDataCellProps<M>) {
	const [editing, setEditing] = useState(false);
	const { copy } = useClipboard();
	const ref = useContextMenu<HTMLTableCellElement>(
		(close) => (
			<Paper shadow="sm" withBorder p={"0.5rem"} style={{ minWidth: "5rem" }}>
				<Text>メニュー</Text>
				<Divider my={5} />
				<Stack gap={3}>
					<Button
						fullWidth
						radius={"xs"}
						size="compact-md"
						variant="outline"
						color="subtle"
						onClick={() => {
							copy(props.value ?? "");
							close();
						}}
					>
						値をコピー
					</Button>
					{props.value !== null && props.field instanceof GuardValue && props.field._optional && (
						<Button
							fullWidth
							radius={"xs"}
							size="compact-md"
							variant="subtle"
							onClick={() => {
								props.onValueChanged?.(null, props.value);
								close();
							}}
						>
							値を「空」にする
						</Button>
					)}
					{props.value !== undefined && props.field instanceof GuardValue && props.field._default && (
						<Button
							fullWidth
							radius={"xs"}
							size="compact-md"
							variant="subtle"
							onClick={() => {
								props.onValueChanged?.(undefined, props.value);
								close();
							}}
						>
							値をデフォルトの「{props.field._default}」にする
						</Button>
					)}
					{props.changed && props.changed !== "delete" && (
						<Button
							fullWidth
							radius={"xs"}
							size="compact-md"
							variant="light"
							color="red"
							onClick={() => {
								props.onValueReset?.();
								close();
							}}
						>
							変更をもとに戻す
						</Button>
					)}
				</Stack>
				<Text>{JSON.stringify(props.value)}</Text>
			</Paper>
		),
		() => props.onSelected?.(props.loc)
	);

	useEffect(() => {
		if (!props.selected) {
			setEditing(false);
		}
	}, [props.selected]);
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: ハッカソンでアクセシビリティは後回し
		<td
			className={`${props.selected ? focusedDataCell(props.selected) : dataCell} ${props.changed === "change" ? changedCell : ""}`}
			onClick={(e) => {
				if (editing) return;
				if (props.selected) {
					setEditing(true);
				} else {
					props.onSelected?.(props.loc);
				}
			}}
			ref={ref}
		>
			<EditingBadges users={props.selectingUsers} />
			<ErrorMaker
				opened={!!props.selected}
				errors={props.field instanceof GuardValue ? props.field.validate(props.value) : undefined} />
			<div className={css({ padding: "0.25em" })}>
				{editing ? (
					<GuardFieldInput
						field={props.field}
						value={props.value ?? ""}
						onValueChange={(s) => {
							props.onValueChanged?.(s, props.value);
						}} />
				) : (
					<GuardFieldDisplay field={props.field} value={props.value} />
				)}
			</div>
		</td>
	);
}
