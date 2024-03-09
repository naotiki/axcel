import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { TableManager } from "../../model/TableManager";
import { ZodTypeAny } from "zod";
import { css } from "@emotion/css";
import * as Diff from "diff";
import { Avatar, Badge, Indicator, NativeSelect, Text, TextInput, Tooltip } from "@mantine/core";
import { AbsoluteCellPosition, mockDatas, mockModel } from "./TableDevTest";
import { useClickOutside, useResizeObserver } from "@mantine/hooks";
import { GuardField } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getRandomName, User, UserRepository } from "../../repo/UserRepository";
import { getRandomColor } from "../../utils/Color";
import { Changes, TableChangesRepository } from "../../repo/TableChangesRepository";
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
	//backgroundColor: "#bbbbff88",
	outline: "2px solid #1111ff",
});

export type Row = {
	name: string;
	type: ZodTypeAny;
};
type TableProviderProps = {
	rows: Row[];
} & PropsWithChildren;
const data = mockModel.injectIdList(mockDatas);
type CellLocation = AbsoluteCellPosition<typeof mockModel>;
export function TableProvider(props: TableProviderProps) {
	const userRepo = useRef<UserRepository | null>(null);
	const tableChangesRepo = useRef<TableChangesRepository<typeof mockModel> | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [users, setUsers] = useState<User[]>([]);

	const [changes, setChanges] = useState<Changes<typeof mockModel> | null>(null);

	useEffect(() => {
		const doc = new Y.Doc();
		const wsProvider = new WebsocketProvider("ws://localhost:1234", "test-room", doc);
		wsProvider.on("status", (event: { status: "disconnected" | "connecting" | "connected" }) => {
			if (event.status === "connected") {
			}
		});

		userRepo.current = new UserRepository(wsProvider.awareness, {
			name: getRandomName().slice(0, 3),
			color: getRandomColor(),
		});
		setUser(userRepo.current.getUser());
		setUsers(userRepo.current.getUsers());
		userRepo.current.onUserChanged((users) => {
			setUsers(users);
		});

		tableChangesRepo.current = new TableChangesRepository<typeof mockModel>(doc);
		tableChangesRepo.current.onChanges((type) => {
			console.log(type);
			if (tableChangesRepo.current !== null) {
				setChanges(tableChangesRepo.current.getState());
			}
		});
	}, []);
	useEffect(() => {
		console.dir(users);
	}, [users]);
	const [selectedCell, setSelectedCell] = useState<CellLocation | null>(null);
	return (
		<>
			<div>
				{users.map((u) => (
					<Avatar src={null} alt={u.user.name} color={u.user.color} key={u.user._uid}>
						{u.user.name}
					</Avatar>
				))}
			</div>
			<div
				className={css({
					overflowX: "visible",
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
										{value.attrs.label ?? key}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{data.map((o, i) => {
							return (
								<tr key={o._id}>
									{Object.entries(o.data).map(([key, value], j) => {
										const loc: CellLocation = {
											id: o._id,
											column: key as keyof typeof mockModel.modelSchema,
										};
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
												value={changes?.getYTextOrNull(loc)?.toString() ?? value.toString()}
												selected={selectedCell?.id === loc.id && selectedCell?.column === loc.column}
												selectingUsers={users
													.filter(
														(u) =>
															u.user._uid !== user?.user._uid &&
															u.cursor.selectedCell?.column === loc.column &&
															u.cursor.selectedCell?.id === loc.id,
													)
													.map((u) => ({ name: u.user.name, color: u.user.color }))}
												onSelected={(l) => {
													setSelectedCell(l);
													userRepo.current?.updateUserCursor({
														selectedCell: l,
													});
												}}
												onValueChanged={(v, old) => {
													const yText = tableChangesRepo.current?.getYTextOrNull(loc);
													if (yText === undefined) {
														tableChangesRepo.current?.addChange(loc, {
															new: new Y.Text(v),
														});
														return;
													}
													console.dir(yText);
													let count = 0;
													for (const part of Diff.diffChars(old, v)) {
														if (part.added) {
															yText.insert(count, part.value);
														} else if (part.removed) {
															yText.delete(count, part.value.length);
														}
														count += part.value.length;
													}
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
		</>
	);
}

type TableDataCellProps = {
	value: string;
	field: GuardField;
	loc: CellLocation;
	selected?: boolean;
	selectingUsers: {
		name: string;
		color: string;
	}[];
	onValueChanged?: (v: string, old: string) => void;
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
						props.onValueChanged?.(s, props.value);
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
			<EditingBadges users={props.selectingUsers} />

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

type EditingBadgesProps = {
	users: {
		name: string;
		color: string;
	}[];
};

function EditingBadges(props: EditingBadgesProps) {
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
							right: `${(-0.25 + i * 0.25).toString()}rem`,
							top: "-0.25rem",
							width: "0.5rem",
							height: "0.5rem",
							background: u.color,
							borderRadius: "50%",
						})}
					/>
				))}
			</div>
		</Tooltip.Floating>
	);
}

function GuardFieldInput({ field, value, ...props }: GuardFieldInputProps) {
	const ref = useClickOutside(() => {
		props.onBlur?.();
	});
	if (field instanceof GuardEnum) {
		return (
			<NativeSelect
				autoFocus
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
			autoFocus
			size="100%"
			variant="unstyled"
			value={value}
			onChange={(e) => props.onValueChange(e.currentTarget.value)}
			ref={ref}
		/>
	);
}
