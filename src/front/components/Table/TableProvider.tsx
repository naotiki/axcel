import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { TableManager } from "../../model/TableManager";
import { ZodTypeAny } from "zod";
import { css } from "@emotion/css";
import * as Diff from "diff";
import { v4 as uuidv4 } from "uuid";
import {
	Avatar,
	Box,
	Center,
	Checkbox,
	NativeSelect,
	NumberInput,
	Popover,
	Text,
	TextInput,
	Tooltip,
	Paper,
	Button,
	Divider,
	Stack,
} from "@mantine/core";
import { DatePickerInput, DateTimePicker } from "@mantine/dates";
import { AbsoluteCellPosition, mockDatas, mockModel } from "./TableDevTest";
import { GuardField } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getRandomName, User, UserRepository } from "../../repo/UserRepository";
import { getRandomColor } from "../../utils/Color";
import { Changes, TableChangesRepository } from "../../repo/TableChangesRepository";
import { GuardValue } from "../../../library/guard/GuardValue";
import { GuardBool } from "../../../library/guard/values/GuardBool";
import { GuardDateTime } from "../../../library/guard/values/GuardDateTime";
import { GuardInt, GuardNumbers } from "../../../library/guard/values/GuardNumbers";
import { useContextMenu } from "../ContextMenuProvider";
import { useClipboard } from "@mantine/hooks";
import { IconTablePlus } from "@tabler/icons-react";
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
	//padding: "0.25em",
	width: "8em",
	maxWidth: "8em",
	border: "1px solid #bbbbbb",
});
const actionCell = css(cell, {
	//padding: "0.25em",
	width: "4em",
	maxWidth: "4em",
	backgroundColor: "#ffffff",
});
const readOnlyCell = css(cell, {
	backgroundColor: "#f0f0f0",
});
const dataCell = css(cell, {
	overflow: "visible",
	//backgroundColor: "#ffffff",
});
const changedCell = css(dataCell, {
	backgroundColor: "#ffffbb",
});
const focusedDataCell = (color: string) =>
	css(dataCell, {
		//backgroundColor: "#bbbbff88",
		outline: `2px solid ${color}`,
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
							<th className={actionCell}>操作</th>
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
									<td className={actionCell}>a</td>
									{Object.entries(mockModel.modelSchema).map(([key, field], j) => {
										const loc: CellLocation = {
											id: o._id,
											column: key as keyof typeof mockModel.modelSchema,
										};
										const value = o.data[key as keyof typeof mockModel.modelSchema];
										if (field._readonly) {
											return (
												<td className={readOnlyCell} key={key}>
													<GuardFieldDisplay field={field} value={value?.toString()} />
												</td>
											);
										}
										return (
											<TableDataCell
												changed={changes === null ? false : changes.isChanged(loc) !== null}
												loc={loc}
												key={key}
												field={field}
												value={changes?.getYTextOrNull(loc)?.toString() ?? value?.toString()}
												selected={
													selectedCell?.id === loc.id && selectedCell?.column === loc.column
														? user?.user.color
														: undefined
												}
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
												onValueReset={() => {
													tableChangesRepo.current?.removeCellChange(loc);
												}}
												onValueChanged={(v, old) => {
													if (!field._isFreeEdit || v === undefined) {
														console.log("not free", v);
														if (tableChangesRepo.current?.update(loc, v) === null) {
															tableChangesRepo.current?.addChange(loc, {
																new: v,
															});
														}
														return;
													}
													const yText = tableChangesRepo.current?.getYTextOrNull(loc) ?? null;
													if (yText === null) {
														tableChangesRepo.current?.addChange(loc, {
															new: new Y.Text(v),
														});
														return;
													}
													let count = 0;
													for (const part of Diff.diffChars(old ?? "", v)) {
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
				<Button fullWidth my={10} leftSection={<IconTablePlus />} onClick={()=>{
					tableChangesRepo.current?.addAddition(uuidv4(),);
				}}>
					 データを追加
				</Button>
			</div>
		</>
	);
}

type TableDataCellProps = {
	value?: string;
	field: GuardField;
	loc: CellLocation;
	changed: boolean;
	selected?: string;
	selectingUsers: {
		name: string;
		color: string;
	}[];
	onValueChanged: (v: string | undefined, old: string | undefined) => void;
	onValueReset: () => void;
	onSelected: (l: CellLocation) => void;
};

function TableDataCell(props: TableDataCellProps) {
	const [editing, setEditing] = useState(false);
	const { copy } = useClipboard();
	const ref = useContextMenu<HTMLTableCellElement>(
		(c) => (
			<Paper shadow="sm" withBorder p={"0.5rem"} style={{ minWidth: "5rem" }}>
				<Text>メニュー</Text>
				<Divider my={5} />
				<Stack gap={3}>
					<Button
						fullWidth
						radius={"xs"}
						size="compact-md"
						variant="outline"
						color="default"
						onClick={() => {
							copy(props.value ?? "");
							c();
						}}
					>
						値をコピー
					</Button>
					{props.value !== undefined && props.field instanceof GuardValue && props.field._optional && (
						<Button
							fullWidth
							radius={"xs"}
							size="compact-md"
							variant="light"
							onClick={() => {
								props.onValueChanged?.(undefined, props.value);
								c();
							}}
						>
							値を「空」にする
						</Button>
					)}
					{ props.field instanceof GuardValue && props.field._default&&props.value !== props.field._default && (
						<Button
							fullWidth
							radius={"xs"}
							size="compact-md"
							variant="light"
							onClick={() => {
								if (props.field instanceof GuardValue && props.field._default)
									props.onValueChanged?.(props.field._default.toString(), props.value);
								c();
							}}
						>
							値を「{props.field._default}」にする
						</Button>
					)}
					{props.changed && (
						<Button
							fullWidth
							radius={"xs"}
							size="compact-md"
							variant="light"
							color="red"
							onClick={() => {
								props.onValueReset?.();
								c();
							}}
						>
							変更をもとの値に戻す
						</Button>
					)}
				</Stack>
			</Paper>
		),
		() => props.onSelected?.(props.loc),
	);

	useEffect(() => {
		if (!props.selected) {
			setEditing(false);
		}
	}, [props.selected]);
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: ハッカソンでアクセシビリティは後回し
		<td
			className={`${props.selected ? focusedDataCell(props.selected) : dataCell} ${
				props.changed ? changedCell : ""
			}`}
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
			{props.value !== undefined ? (
				<ErrorMaker
					opened={!!props.selected}
					errors={props.field instanceof GuardValue ? props.field.validate(props.value) : undefined}
				/>
			) : (
				<></>
			)}
			<div className={css({ padding: "0.25em" })}>
				{editing ? (
					<GuardFieldInput
						field={props.field}
						value={props.value ?? ""}
						onValueChange={(s) => {
							props.onValueChanged?.(s, props.value);
						}}
					/>
				) : (
					<GuardFieldDisplay field={props.field} value={props.value} />
				)}
			</div>
		</td>
	);
}

type GuardFieldInputProps = {
	field: GuardField;
	value?: string;
	onValueChange: (v: string) => void;
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
							right: `${(i * 0.25).toString()}rem`,
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

type GuardFieldDisplayProps = {
	field: GuardField;
	value?: string;
};

function GuardFieldDisplay({ field, value }: GuardFieldDisplayProps) {
	if (value === undefined) return <Text c={"gray"}>{"< 空 >"}</Text>;
	if (field instanceof GuardBool) {
		return (
			<Center>
				<Checkbox checked={value.toLowerCase() === "true"} variant="outline" readOnly />
			</Center>
		);
	}

	const displayTest = field instanceof GuardEnum ? field._enumLabels[value] ?? value : value;
	return <Text style={{ overflow: "clip", textWrap: "nowrap" }}>{displayTest}</Text>;
}

function GuardFieldInput({ field, value, ...props }: GuardFieldInputProps) {
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
			/>
		);
	}
	if (field instanceof GuardBool) {
		return (
			<Center>
				<Checkbox
					checked={value?.toLowerCase() === "true"}
					onChange={(e) => props.onValueChange(e.currentTarget.checked.toString())}
				/>
			</Center>
		);
	}
	if (field instanceof GuardDateTime) {
		if (field.isDateOnly) {
			return (
				<DatePickerInput
					valueFormat="YYYY年MM月DD日"
					autoFocus
					value={value ? new Date(value) : null}
					onChange={(d) => props.onValueChange(d?.toLocaleDateString() ?? "")}
				/>
			);
		}
		return (
			<DateTimePicker
				valueFormat="YYYY年MM月DD日 HH:MM"
				autoFocus
				value={value ? new Date(value) : null}
				onChange={(d) => props.onValueChange(d?.toLocaleString() ?? "")}
			/>
		);
	}

	if (field instanceof GuardNumbers) {
		return (
			<NumberInput
				autoFocus
				size="100%"
				rightSectionWidth={"auto"}
				variant="unstyled"
				value={value}
				min={field.minValue}
				max={field.maxValue}
				allowDecimal={!(field instanceof GuardInt)}
				onChange={(e) => props.onValueChange(e.toString())}
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
		/>
	);
}

type ErrorMakerProps = {
	errors?: string[];
	opened: boolean;
};
function ErrorMaker({ errors, opened }: ErrorMakerProps) {
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
}
