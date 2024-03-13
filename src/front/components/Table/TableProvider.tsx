import { createContext, useContext, useEffect, useRef, useState } from "react";
import { TableManager } from "../../model/TableManager";
import { ZodTypeAny, string } from "zod";
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
	Group,
	Menu,
	ActionIcon,
	rem,
	Space,
	HoverCard,
} from "@mantine/core";
import { DatePickerInput, DateTimePicker } from "@mantine/dates";
import { AbsoluteCellPosition, mockDatas, mockModel } from "./TableDevTest";
import { GuardField } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { User, UserRepository } from "../../repo/UserRepository";
import { getRandomColor } from "../../utils/Color";
import {
	Changes,
	MapValueType,
	CellChangeType,
	TableChangesRepository,
	RowChangeType,
	genSelectorId,
	genCellId,
} from "../../repo/TableChangesRepository";
import { GuardValue } from "../../../library/guard/GuardValue";
import { GuardBool } from "../../../library/guard/values/GuardBool";
import { GuardDateTime } from "../../../library/guard/values/GuardDateTime";
import { GuardInt, GuardNumbers } from "../../../library/guard/values/GuardNumbers";
import { useContextMenu } from "../ContextMenuProvider";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconCaretDownFilled, IconEdit, IconPlus, IconTablePlus, IconTrash } from "@tabler/icons-react";
import {
	GuardModelBase,
	GuardModelColumn,
	GuardModelInput,
	GuardModelOutput,
	GuardModelSelector,
} from "@/library/guard/GuardModel";
import { useUser } from "../UserProvider";
import { IconTextWithTooltip } from "./IconTextWithTooltip";
import React from "react";
import { hc } from "hono/client";
import { AxcelGet, AxcelPost } from "@/api";
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
	position: "sticky",
	top: 0,
	zIndex: 1,
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
	//width: "4em",
	paddingInline: "0.5em",
	width: "auto",
	//maxWidth: "4em",
	backgroundColor: "#ffffff",
});
const readOnlyCell = css(cell, {
	backgroundColor: "#f0f0f099",
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
type TableProviderProps<M extends GuardModelBase> = {
	model: M;
};

//type CellLocation = AbsoluteCellPosition<typeof mockModel>;

export function TableProvider<M extends GuardModelBase>({ model, ...props }: TableProviderProps<M>) {
	const userRepo = useRef<UserRepository<M> | null>(null);
	const tableChangesRepo = useRef<TableChangesRepository<M> | null>(null);
	const [user, setUser] = useState<User<M> | null>(null);
	const [users, setUsers] = useState<User<M>[]>([]);
	const authUser = useUser();
	const [changes, setChanges] = useState<Changes<M> | null>(null);
	const [locked, setLocked] = useState<boolean | null>(null);
	const lastUpdated = useRef<number | null>(null);
	const [data, setData] = useState(model.injectIdList(mockDatas));
	useEffect(() => {
		const doc = new Y.Doc();
		const wsProvider = new WebsocketProvider("ws://localhost:8080/yws", model.name, doc);
		wsProvider.on("status", (event: { status: "disconnected" | "connecting" | "connected" }) => {
			if (event.status === "connected") {
			}
		});
		userRepo.current = new UserRepository(wsProvider.awareness, {
			name: authUser.name ?? "???",
			color: getRandomColor(),
		});
		setUser(userRepo.current.getUser());
		setUsers(userRepo.current.getUsers());
		userRepo.current.onUserChanged((users) => {
			setUsers(users);
		});
		hc<AxcelGet>("http://localhost:8080/api")
			.axcel[":model"].$get({ param: { model: model.name } })
			.then(async (res) => {
				const data = await res.json();
				if (Array.isArray(data)) {
					setData(model.injectIdList(data as GuardModelOutput<M>[]));
					lastUpdated.current = Date.now();
				}
			});
		tableChangesRepo.current = new TableChangesRepository<M>(doc);
		tableChangesRepo.current.onChanges((type) => {
			if (tableChangesRepo.current !== null) {
				const meta = tableChangesRepo.current.getMetaData();
				setLocked(meta.locked ?? false);
				setChanges(tableChangesRepo.current.getState());
				console.log(meta.updatedAt, lastUpdated.current);
				if (meta.updatedAt && lastUpdated.current && meta.updatedAt > lastUpdated.current) {
					hc<AxcelGet>("http://localhost:8080/api")
						.axcel[":model"].$get({ param: { model: model.name } })
						.then(async (res) => {
							const data = await res.json();
							if (Array.isArray(data)) {
								setData(model.injectIdList(data as GuardModelOutput<M>[]));
								lastUpdated.current = Date.now();
							}
						});
				}
			}
		});
	}, [authUser, model]);
	const [selectedCell, setSelectedCell] = useState<string | null>(null);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [opened, { close, open }] = useDisclosure(false);
	const [showValidationErrorText, setShowValidationErrorText] = useState(false);
	return (
		<Box maw={"100%"}>
			<Group justify="space-between" w={"100%"} py={"md"}>
				<Avatar.Group>
					{users
						.filter((u) => u.user._uid !== user?.user._uid)
						.slice(0, 5)
						.map((u) => (
							<Avatar src={null} alt={u.user.name} color={u.user.color} key={u.user._uid}>
								{u.user.name?.slice(0, 2)}
							</Avatar>
						))}
					{users.length > 7 && (
						<Avatar>+{users.filter((u) => u.user._uid !== user?.user._uid).length - 5}</Avatar>
					)}
				</Avatar.Group>
				<Space />

				<Group>
					<IconTextWithTooltip
						icon={<IconEdit />}
						text={(Object.keys(changes?.changes ?? {}).length ?? 0).toString()}
						tooltip={`変更 : ${Object.keys(changes?.changes ?? {}).length ?? 0} 件`}
						color="yellow"
					/>
					<IconTextWithTooltip
						icon={<IconPlus />}
						text={(Object.keys(changes?.addtions ?? {}).length ?? 0).toString()}
						tooltip={`追加 : ${(Object.keys(changes?.addtions ?? {}).length ?? 0).toString()} 行`}
						color="green"
					/>
					<IconTextWithTooltip
						icon={<IconTrash />}
						text={(changes?.deletions.length ?? 0).toString()}
						tooltip={`削除 : ${changes?.deletions.length ?? 0} 行`}
						color="red"
					/>
					<Popover
						opened={opened || showValidationErrorText}
						withArrow
						shadow="md"
						width={400}
						position="top"
					>
						<Popover.Target>
							<Button
								onMouseEnter={open}
								onMouseLeave={close}
								loading={locked ?? false}
								disabled={!changes?.hasChanges()}
								onClick={async () => {
									setLocked(true);
									const changes = tableChangesRepo.current?.getState();
									if (!changes?.hasChanges()) return;
									for (const [key, field] of Object.entries(model.modelSchema)) {
										const strings = Object.entries(changes.addtions)
											.map(([_, v]) => v[key as keyof M["modelSchema"]])
											.concat(
												Object.values(changes.changes)
													.filter((v) => v.column === key)
													.map((v) => v.new),
											);
										for (const value of strings) {
											if (field.validate(value)) {
												setShowValidationErrorText(true);
												setTimeout(() => {
													setShowValidationErrorText(false);
												}, 5000);
												setLocked(false);
												return;
											}
										}
									}
									const result = await hc<AxcelPost>("http://localhost:8080/api").axcel[":model"].$post({
										param: {
											model: model.name,
										},
									});
									console.dir(result);
									setLocked(false);
								}}
							>
								変更を反映
							</Button>
						</Popover.Target>
						<Popover.Dropdown>
							<Text>
								{showValidationErrorText
									? "入力値にエラーがあるため反映できませんでした。"
									: "変更をデータベースに反映します。反映中はロックが掛かり、変更を加えられなくなります"}
							</Text>
						</Popover.Dropdown>
					</Popover>
				</Group>
			</Group>
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
							{Object.entries(model.modelSchema).map(([key, value]) => {
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
							const sId = genSelectorId(o.__id);
							return (
								<tr
									key={sId}
									className={changes?.deletions.includes(o.__id) ? css({ backgroundColor: "#ffcccc" }) : ""}
								>
									<ActionCell
										changed={changes?.isChangedRow(o.__id) ?? null}
										selected={selectedRows.includes(sId)}
										onChange={(v) => {
											if (v) {
												setSelectedRows((s) => [...s, sId]);
											} else {
												setSelectedRows((s) => s.filter((r) => r !== sId));
											}
										}}
										onRowRecover={() => {
											tableChangesRepo.current?.recoverRow(o.__id);
										}}
										onRowDelete={() => {
											tableChangesRepo.current?.deleteRow(o.__id);
										}}
									/>
									{Object.entries(model.modelSchema).map(([key, field]) => {
										const loc: AbsoluteCellPosition<M> = {
											id: o.__id,
											column: key as GuardModelColumn<M>,
										};
										const value = o.data[key as GuardModelColumn<M>];
										if (field._readonly) {
											return (
												<td className={readOnlyCell} key={key}>
													<GuardFieldDisplay field={field} value={value?.toString()} />
												</td>
											);
										}
										const v =
											changes === null || !changes?.isChanged(loc) || changes?.isChanged(loc) === "delete"
												? value
												: changes.getValue(loc);
										return (
											<TableDataCell
												changed={changes === null ? null : changes.isChanged(loc)}
												loc={loc}
												key={key}
												field={field}
												value={v instanceof Y.Text || (v !== null && v !== undefined) ? v.toString() : v}
												selected={
													selectedCell && selectedCell === genCellId(loc) ? user?.user.color : undefined
												}
												selectingUsers={users
													.filter(
														(u) =>
															u.user._uid !== user?.user._uid &&
															u.cursor?.selectedCell?.column === loc.column &&
															u.cursor?.selectedCell?.id === loc.id,
													)
													.map((u) => ({ name: u.user.name, color: u.user.color }))}
												onSelected={(l) => {
													setSelectedCell(genCellId(l));
													userRepo.current?.updateUserCursor({
														selectedCell: l,
													});
												}}
												onValueReset={() => {
													tableChangesRepo.current?.removeCellChange(loc);
												}}
												onValueChanged={(v, old) => {
													if (changes?.isChangedRow(loc.id) === "delete") return;
													if (!field._isFreeEdit || v === undefined || v === null) {
														console.log("not free", v);
														if (tableChangesRepo.current?.update(loc, v) === false) {
															tableChangesRepo.current?.addChange(loc, {
																column: loc.column,
																__id: loc.id,
																new: v,
															});
														}
														return;
													}
													const yText =
														(tableChangesRepo.current?.getValue(loc) as Y.Text | null | undefined) ?? null;
													if (yText === null) {
														tableChangesRepo.current?.addChange(loc, {
															column: loc.column,
															__id: loc.id,
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
						{changes?.addtions &&
							Object.entries(changes.addtions).map(([id, addition]) => {
								const selector = { __newuuid: id } as GuardModelSelector<M>;
								const sId = genSelectorId(selector);
								return (
									<tr
										key={id}
										className={css({
											backgroundColor: "#ccffcc",
										})}
									>
										<ActionCell
											changed={changes?.isChangedRow(selector)}
											selected={selectedRows.includes(sId)}
											onChange={(v) => {
												if (v) {
													setSelectedRows((s) => [...s, sId]);
												} else {
													setSelectedRows((s) => s.filter((r) => r !== sId));
												}
											}}
											onRowDelete={() => {
												tableChangesRepo.current?.deleteRow(selector);
											}}
										/>
										{Object.entries(model.modelSchema).map(([key, field]) => {
											const loc: AbsoluteCellPosition<M> = {
												id: selector,
												column: key as GuardModelColumn<M>,
											};
											const value = addition[key as keyof M["modelSchema"]];
											if (field._readonly) {
												return (
													<td className={readOnlyCell} key={key}>
														<GuardFieldDisplay field={field} value={value?.toString()} />
													</td>
												);
											}
											const v = changes === null || !changes?.isChanged(loc) ? value : changes.getValue(loc);
											return (
												<TableDataCell<M>
													changed={"add"}
													loc={loc}
													key={key}
													field={field}
													value={v instanceof Y.Text || (v !== null && v !== undefined) ? v.toString() : v}
													selected={
														selectedCell && selectedCell === genCellId(loc) ? user?.user.color : undefined
													}
													selectingUsers={users
														.filter(
															(u) =>
																u.user._uid !== user?.user._uid &&
																u.cursor?.selectedCell?.column === loc.column &&
																u.cursor?.selectedCell?.id === loc.id,
														)
														.map((u) => ({ name: u.user.name, color: u.user.color }))}
													onSelected={(l) => {
														setSelectedCell(genCellId(l));
														userRepo.current?.updateUserCursor({
															selectedCell: l,
														});
													}}
													onValueReset={() => {
														tableChangesRepo.current?.update(
															loc,
															field instanceof GuardValue && field._default ? undefined : null,
														);
													}}
													onValueChanged={(v, old) => {
														if (!field._isFreeEdit || v === undefined || v === null) {
															console.log("not free", v);
															if (tableChangesRepo.current?.update(loc, v) === false) {
																throw new Error("illigal");
															}
															return;
														}
														const yText =
															(tableChangesRepo.current?.getValue(loc) as Y.Text | null | undefined) ?? null;
														if (yText === null) {
															tableChangesRepo.current?.update(loc, new Y.Text(v));
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
				<Button
					fullWidth
					my={10}
					leftSection={<IconTablePlus />}
					onClick={() => {
						tableChangesRepo.current?.addAddition(
							uuidv4(),
							Object.fromEntries(
								Object.entries(model.modelSchema).map(([key, field]) => {
									return [key, field instanceof GuardValue && field._default ? undefined : null];
								}),
							) as { [K in keyof GuardModelInput<M>]: MapValueType },
						);
					}}
				>
					データを追加
				</Button>
			</div>
		</Box>
	);
}

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
					}}
				/>
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

function TableDataCell<M extends GuardModelBase>(props: TableDataCellProps<M>) {
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
				props.changed === "change" ? changedCell : ""
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
			<ErrorMaker
				opened={!!props.selected}
				errors={props.field instanceof GuardValue ? props.field.validate(props.value) : undefined}
			/>
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
	value?: string | null | undefined;
};

function GuardFieldDisplay({ field, value }: GuardFieldDisplayProps) {
	if (value === null) return <Text c={"gray"}>{"< 空 >"}</Text>;
	if (value === undefined) return <Text c={"gray"}>{"< デフォルト >"}</Text>;
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
				value={value ? Number(value) : undefined}
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
const ErrorMaker = React.memo<ErrorMakerProps>(({ errors, opened }: ErrorMakerProps) => {
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
