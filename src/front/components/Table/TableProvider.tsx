import { createContext, PropsWithChildren, useContext, useRef, useState } from "react";
import { CellLocation, TableManager } from "../../model/TableManager";
import { ZodTypeAny } from "zod";
import { css } from "@emotion/css";
import { NativeSelect, Select, Text, TextInput } from "@mantine/core";
import { mockDatas, mockModel } from "./TableDevTest";
import { useClickOutside, useHover } from "@mantine/hooks";
import { GuardField } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";

const TableContext = createContext<TableManager | null>(null);
//Wrapper
export function useTable() {
	const ctx = useContext(TableContext);
	if (!ctx) {
		throw new Error("TableContext not found. the TableElement must be surrounded by <TableProvider>");
	}
	return ctx;
}
const header = css({
	backgroundColor: "#f0f0f0",
	borderBottom: "3px solid #000",
});

const cell = css({
	padding: "0.25em",
	width: "8em",
	maxWidth: "8em",
	border: "1px solid #bbbbbb",
});
const readOnlyCell = css(cell, {
	backgroundColor: "#f0f0f0",
});
const dataCell = css(cell, {
	overflow: "visible",
	backgroundColor: "#ffffff",
});
const focusedDataCell = css(dataCell, {
	backgroundColor: "#bbbbff88",
	outline: "1px solid #1111ff",
});

export type Row = {
	name: string;
	type: ZodTypeAny;
};
type TableProviderProps = {
	rows: Row[];
} & PropsWithChildren;

/*  */
export function TableProvider(props: TableProviderProps) {
	const m = useRef(new TableManager());
	const [selectedCell, setSelectedCell] = useState<CellLocation | null>(null);
	return (
		<TableContext.Provider value={m.current}>
			<div
				className={css({
					overflowX: "scroll",
					maxWidth: "100%",
				})}
			>
				<table
					className={css({
						tableLayout: "fixed",
						textAlign: "center",
						borderCollapse: "collapse",
					})}
				>
					<thead className={header}>
						<tr>
							{Object.entries(mockModel.modelSchema).map(([key, value]) => {
								return (
									<th className={cell} key={key}>
										{value._label ?? key}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{mockDatas.map((row, i) => {
							return (
								<tr key={row.id}>
									{Object.entries(row).map(([key, value], j) => {
										const loc = { row: i, column: j };
										const field = mockModel.modelSchema[key as keyof typeof mockModel.modelSchema];
										if (field._readonly) {
											return (
												<td className={readOnlyCell} key={key}>
													{value}
												</td>
											);
										}
										return (
											<TableDataCell
												loc={loc}
												key={key}
												field={field}
												value={value.toString()}
												selected={selectedCell?.column === loc.column && selectedCell?.row === loc.row}
												onSelected={(l) => {
													setSelectedCell(l);
												}}
											/>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</TableContext.Provider>
	);
}

type TableDataCellProps = {
	value: string;
	field: GuardField;
	loc: CellLocation;
	selected?: boolean;
	onValueChanged?: (v: string) => void;
	onSelected?: (l: CellLocation) => void;
};

function TableDataCell(props: TableDataCellProps) {
	const displayTest =
		props.field instanceof GuardEnum ? props.field._enumLabels[props.value] ?? props.value : props.value;
	const [editing, setEditing] = useState(false);
	if (editing) {
		return (
			<td className={focusedDataCell}>
				<GuardFieldInput
					field={props.field}
					value={props.value}
					onValueChange={(s) => {
						props.onValueChanged?.(s);
					}}
					onBlur={() => {
						setEditing(false);
					}}
				/>
			</td>
		);
	}
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: ハッカソンでアクセシビリティは後回し
		<td
			className={props.selected ? focusedDataCell : dataCell}
			onClick={() => {
				if (props.selected) {
					setEditing(true);
				} else {
					props.onSelected?.(props.loc);
				}
			}}
		>
			<Text>{displayTest}</Text>
		</td>
	);
}

type GuardFieldInputProps = {
	field: GuardField;
	value: string;
	onValueChange: (v: string) => void;
	onBlur?: () => void;
};
function GuardFieldInput({ field, value, ...props }: GuardFieldInputProps) {
	const ref = useClickOutside(() => {
		props.onBlur?.();
	});
	if (field instanceof GuardEnum) {
		return (
			<NativeSelect
				size="100%"
				rightSectionWidth={"auto"}
				variant="unstyled"
				data={Object.entries(field._enumLabels).map(([value, label]) => ({
					value: value,
					label: label ?? value,
				}))}
				value={value}
				onChange={(e) => props.onValueChange(e.currentTarget.value)}
				ref={ref}
			/>
		);
	}
	return (
		<TextInput
			size="100%"
			variant="unstyled"
			value={value}
			onChange={(e) => props.onValueChange(e.currentTarget.value)}
			ref={ref}
		/>
	);
}
