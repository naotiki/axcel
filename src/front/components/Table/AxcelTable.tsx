import { useEffect, useState } from "react";
import { css } from "@emotion/css";
import { AbsoluteCellPosition } from "@/AbsoluteCellPosition";
import * as Y from "yjs";
import { User, UserRepository } from "../../repo/UserRepository";
import { Changes, TableChangesRepository, genSelectorId, genCellId } from "../../repo/TableChangesRepository";
import { GuardValue } from "../../../library/guard/GuardValue";
import {
	GuardModelBase,
	GuardModelColumn,
	GuardModelOutputWithId,
	GuardModelSelector,
	GuardModelSort,
	GuardRelationRefAny,
} from "@/library/guard/GuardModel";
import { GuardFieldDisplay } from "./GuardFieldDisplay";
import { TableDataCell, cell } from "./TableDataCell";
import { ActionCell } from "./ActionCell";
import { GuardField, GuardRelation } from "@/library/guard/guard";
import { Button, HoverCard, Text } from "@mantine/core";
import React from "react";
import {
	IconCaretDownFilled,
	IconCaretUpDown,
	IconCaretUpFilled,
} from "@tabler/icons-react";
import { RouteAnchor } from "../RouteAnchor";
import { yTextUpdate } from "@/utils/yTextUtils";
export const header = css({
	position: "sticky",
	top: 0,
	zIndex: 1,
	backgroundColor: "#f0f0f0",
	borderBottom: "3px solid #000",
});

export const actionCell = css(cell, {
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
export type AxcelTableProps<M extends GuardModelBase> = {
	model: M;
	data: GuardModelOutputWithId<M>[];
	changes: Changes<M>;
	user: User;
	users: User[];
	tableChangesRepo: TableChangesRepository<M>;
	userRepo: UserRepository;
	locked: boolean;
	sort: GuardModelSort<M>;
	onSortChanged: (sort: GuardModelSort<M>) => void;
};
export function AxcelTable<M extends GuardModelBase>({
	model,
	data,
	changes,
	user,
	users,
	tableChangesRepo,
	userRepo,
	locked,
	sort,
	onSortChanged,
}: AxcelTableProps<M>) {
	const [selectedCell, setSelectedCell] = useState<string | null>(null);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	useEffect(() => {
		if (locked) {
			setSelectedCell(null);
			userRepo.updateUserCursor({
				selectedCellId: undefined,
			});
		}
	}, [locked, userRepo]);
	return (
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
							<AxcelTableTh
								key={key}
								field={value}
								name={value.attrs.label ?? key}
								sorted={sort[key as GuardModelColumn<M>]}
								onSortChange={(): void => {
									const newSort = { ...sort };
									if (newSort[key as GuardModelColumn<M>] === "asc") {
										newSort[key as GuardModelColumn<M>] = "desc";
									} else if (newSort[key as GuardModelColumn<M>] === "desc") {
										newSort[key as GuardModelColumn<M>] = undefined;
									} else {
										newSort[key as GuardModelColumn<M>] = "asc";
									}
									onSortChanged(newSort);
								}}
							/>
						);
					})}
				</tr>
			</thead>
			<tbody>
				{data.map((o) => {
					const sId = genSelectorId(o.__id);
					return (
						<tr
							key={sId}
							className={
								changes?.deletions?.map((s) => genSelectorId(s)).includes(genSelectorId(o.__id))
									? css({ backgroundColor: "#ffcccc" })
									: ""
							}
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
									tableChangesRepo.recoverRow(o.__id);
								}}
								onRowDelete={() => {
									tableChangesRepo.deleteRow(o.__id);
								}}
							/>
							{Object.entries(model.modelSchema).map(([key, field]) => {
								const loc: AbsoluteCellPosition<M> = {
									id: o.__id,
									column: key as GuardModelColumn<M>,
								};
								const value = o.data[key as GuardModelColumn<M>];
								if (field instanceof GuardValue&&field._readonly) {
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
									<TableDataCell<M>
										changed={changes === null ? null : changes.isChanged(loc)}
										loc={loc}
										key={key}
										field={field}
										value={(v instanceof Y.Text || v !== null && v !== undefined)&&!(v as GuardRelationRefAny)?.ref ? v.toString() : v}
										selected={selectedCell && selectedCell === genCellId(loc) ? user?.user.color : undefined}
										selectingUsers={users
											.filter(
												(u) => u.user._uid !== user?.user._uid && u.cursor?.selectedCellId === genCellId(loc),
											)
											.map((u) => ({ name: u.user.name, color: u.user.color }))}
										onSelected={(l) => {
											const id = genCellId(l);
											setSelectedCell(id);
											userRepo.updateUserCursor({
												selectedCellId: id,
											});
										}}
										onValueReset={() => {
											tableChangesRepo.removeCellChange(loc);
										}}
										onValueChanged={(v, old) => {
											if (changes?.isChangedRow(loc.id) === "delete") return;
											if (
												(field instanceof GuardValue && !field._isFreeEdit) ||
												v === undefined ||
												v === null || (v as GuardRelationRefAny)?.ref
											) {
												console.log("not free", v);
												if (tableChangesRepo.update(loc, v) === false) {
													tableChangesRepo.addChange(loc, {
														column: loc.column,
														__id: loc.id,
														new: v,
													});
												}
												return;
											}
											const yText = (tableChangesRepo.getValue(loc) as Y.Text | null | undefined) ?? null;
											if (yText === null) {
												tableChangesRepo.addChange(loc, {
													column: loc.column,
													__id: loc.id,
													new: new Y.Text(v),
												});
												return;
											}

											yTextUpdate(yText, v, old ?? "");
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
										tableChangesRepo.deleteRow(selector);
									}}
								/>
								{Object.entries(model.modelSchema).map(([key, field]) => {
									const loc: AbsoluteCellPosition<M> = {
										id: selector,
										column: key as GuardModelColumn<M>,
									};
									const value = addition[key as keyof M["modelSchema"]];
									if (field instanceof GuardValue && field._readonly) {
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
											value={(v instanceof Y.Text || (v !== null && v !== undefined))&&!(v as GuardRelationRefAny).ref ? v.toString() : v}
											selected={
												selectedCell && selectedCell === genCellId(loc) ? user?.user.color : undefined
											}
											selectingUsers={users
												.filter(
													(u) =>
														u.user._uid !== user?.user._uid && u.cursor?.selectedCellId === genCellId(loc),
												)
												.map((u) => ({ name: u.user.name, color: u.user.color }))}
											onSelected={(l) => {
												const id = genCellId(l);
												setSelectedCell(id);
												userRepo.updateUserCursor({
													selectedCellId: id,
												});
											}}
											onValueReset={() => {
												tableChangesRepo.update(
													loc,
													field instanceof GuardValue && field._default ? undefined : null,
												);
											}}
											onValueChanged={(v, old) => {
												if (
													(field instanceof GuardValue && !field._isFreeEdit) ||
													v === undefined ||
													v === null ||(v as GuardRelationRefAny)?.ref
												) {
													console.log("not free", v);
													if (tableChangesRepo.update(loc, v) === false) {
														throw new Error("illigal");
													}
													return;
												}
												const yText = (tableChangesRepo.getValue(loc) as Y.Text | null | undefined) ?? null;
												if (yText === null) {
													tableChangesRepo.update(loc, new Y.Text(v));
													return;
												}
												yTextUpdate(yText,  v, old ?? "");
											}}
										/>
									);
								})}
							</tr>
						);
					})}
			</tbody>
		</table>
	);
}
export type SortType = "asc" | "desc" | undefined;
type AxcelTableThProps = {
	field: GuardField;
	name: string;
	sorted: SortType;
	onSortChange: () => void;
};
const AxcelTableTh = React.memo(({ field, name, ...props }: AxcelTableThProps) => {
	return (
		<th className={cell}>
			<HoverCard position="top" withArrow shadow="sm" openDelay={500} closeDelay={100}>
				<HoverCard.Target>
					<Button
						leftSection={
							props.sorted === "asc" ? (
								<IconCaretUpFilled strokeWidth={1} style={{ width: "1rem", height: "1rem" }} />
							) : props.sorted === "desc" ? (
								<IconCaretDownFilled strokeWidth={1} style={{ width: "1rem", height: "1rem" }} />
							) : (
								<IconCaretUpDown strokeWidth={1} style={{ width: "1rem", height: "1rem" }} />
							)
						}
						variant="transparent"
						size="compact-md"
						fullWidth
						color="black"
						onClick={props.onSortChange}
					>
						<Text>
							{name}
						</Text>
					</Button>
				</HoverCard.Target>
				<HoverCard.Dropdown style={{ maxWidth: "16rem" }}>
					<Text size="md" fw={700}>
						{name}
					</Text>
					<Text>{field.attrs.description ?? ""}</Text>
					{field instanceof GuardValue && (
						<>
							<Text>タイプ : {field._typeLabel}</Text>
							{field._default && (
								<Text>
									デフォルト値 :{" "}
									{typeof field._default !== "object" ? field._default?.toString() : "システム生成"}
								</Text>
							)}
							{[field._id, field._optional, field._readonly, field._unique]
								.map((a, i) => (a ? ["ID", "空を許可", "変更不可", "ユニーク"][i] : undefined))
								.filter((e) => e)
								.join(", ")}
						</>
					)}
					{field instanceof GuardRelation && (
						<>
							<Text>タイプ : リンク</Text>
							<Text>リンク先 - <RouteAnchor to="/model/$name" params={{name:field.model.name}}>{field.model.dispName()}</RouteAnchor></Text>
						</>
					)}
				</HoverCard.Dropdown>
			</HoverCard>
		</th>
	);
});
