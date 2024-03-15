import {
	Center,
	Checkbox,
	Menu,
	NativeSelect,
	NumberInput,
	TextInput,
	Text,
	UnstyledButton,
	Box,
	Group,
} from "@mantine/core";
import { DatePickerInput, DateTimePicker } from "@mantine/dates";
import { GuardField, GuardRelation, GuardRelationList } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";
import { GuardBool } from "../../../library/guard/values/GuardBool";
import { GuardDateTime } from "../../../library/guard/values/GuardDateTime";
import { GuardInt, GuardNumbers } from "../../../library/guard/values/GuardNumbers";
import { GuardModelOutput, GuardModelOutputWithId, GuardRelationRefAny } from "@/library/guard/GuardModel";
import { useEffect, useState } from "react";
import { hc } from "hono/client";
import { AxcelGet } from "@/api";
import { genSelectorId } from "@/front/repo/TableChangesRepository";
import { cell, dataCell } from "./TableDataCell";
import { header } from "./AxcelTable";
import { css } from "@emotion/css";
import { GuardFieldDisplay } from "./GuardFieldDisplay";
import { RouteAnchor } from "../RouteAnchor";

type GuardFieldInputProps = {
	field: GuardField;
	value?: string | GuardRelationRefAny;
	onValueChange: (v: string | GuardRelationRefAny) => void;
};
export function GuardFieldInput({ field, value, ...props }: GuardFieldInputProps) {
	if (field instanceof GuardRelationList) return <></>;
	if (field instanceof GuardRelation) {
		const [data, setData] = useState<GuardModelOutputWithId<typeof field.model>[]>([]);
		const [opened, setOpened] = useState(true);
		useEffect(() => {
			hc<AxcelGet>(`${import.meta.env.BASE_URL}api`)
				.axcel[":model"].$get({
					param: { model: field.model.name },
				})
				.then(async (res) => {
					const d = await res.json();
					setData(field.model.injectIdList(d as GuardModelOutput<typeof field.model>[]));
				});
		}, [field]);
		return (
			<Menu shadow="md" opened={opened} onChange={setOpened}>
				<Menu.Target>
					<Box>
						<GuardFieldDisplay field={field} value={value} />
					</Box>
				</Menu.Target>
				<Menu.Dropdown p={20}>
					<Group>
						<Text fw={700}>データリンク</Text>
						<Text> - </Text>
						<Text><RouteAnchor to="/model/$name" params={{ name: field.model.name }}>{field.model.dispName()}</RouteAnchor> と関連付けます。</Text>
					</Group>

					<table
						className={css({
							tableLayout: "fixed",
							textAlign: "center",
							borderCollapse: "collapse",
						})}
					>
						<thead className={header}>
							<tr>
								{Object.entries(field.model.modelSchema).map(([k, v]) => (
									<th key={k} className={cell}>
										<Text>{v.attrs.label ?? k}</Text>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{data.map((d) => (
								<UnstyledButton
									component={"tr"}
									key={genSelectorId(d.__id)}
									className={css({
										":hover": {
											backgroundColor: "lightgray",
										},
									})}
									onClick={() => {
										console.log(d.__id, d.data);
										props.onValueChange({
											ref: d.__id,
											value: d.data,
										} as GuardRelationRefAny);
										setOpened(false);
									}}
								>
									{Object.entries(d.data).map(([k, v]) => (
										<td key={k} className={dataCell}>
											<Text style={{ textAlign: "center" }}>{v}</Text>
										</td>
									))}
								</UnstyledButton>
							))}
						</tbody>
					</table>
				</Menu.Dropdown>
			</Menu>
		);
	}
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
					valueFormat="YYYY/MM/DD"
					autoFocus
					value={value ? new Date(value) : null}
					onChange={(d) => props.onValueChange(d?.toLocaleDateString() ?? "")}
				/>
			);
		}
		return (
			<DateTimePicker
				valueFormat="YYYY/MM/DD HH:mm"
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
