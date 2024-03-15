import { Center, Checkbox, HoverCard, Popover, Text, UnstyledButton } from "@mantine/core";
import { GuardField, GuardRelation } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";
import { GuardBool } from "../../../library/guard/values/GuardBool";
import { GuardRelationRefAny } from "@/library/guard/GuardModel";
import { GuardDateTime } from "@/library/guard/values/GuardDateTime";
import dayjs from "dayjs";
import { css } from "@emotion/css";
import { header } from "./AxcelTable";
import { genSelectorId } from "@/front/repo/TableChangesRepository";
import { cell, dataCell } from "./TableDataCell";
import { IconLink } from "@tabler/icons-react";
type GuardFieldDisplayProps = {
	field: GuardField;
	value?: GuardRelationRefAny | string | null | undefined;
};
export function GuardFieldDisplay({ field, value }: GuardFieldDisplayProps) {
	if (value === null) return <Text c={"gray"}>{"< 空 >"}</Text>;
	if (value === undefined) return <Text c={"gray"}>{"< デフォルト >"}</Text>;
	if (typeof value !== "string" && field instanceof GuardRelation) {
		console.dir(value);
		return (
			<Center>
				<HoverCard position="top" withArrow closeDelay={0} openDelay={0}>
					<HoverCard.Target>
						<IconLink color={"gray"} />
					</HoverCard.Target>
					<HoverCard.Dropdown>
						<Text fw={700}>リンクされたデータ</Text>
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
								<tr key={genSelectorId(value.ref)}>
									{Object.entries(value?.value ?? {}).map(([k, v]) => (
										<td key={k} className={dataCell}>
											<Text style={{ textAlign: "center" }}>{v}</Text>
										</td>
									))}
								</tr>
							</tbody>
						</table>
					</HoverCard.Dropdown>
				</HoverCard>
			
				<Text c={"gray"} ml={5}>
							{Object.entries(value.ref)
								.map(([k, v]) => `${field.model.modelSchema[k].attrs.label ?? k}:${v}`)
								.join(",")}
						</Text>
			</Center>
		);
	}
	if (typeof value === "string" && field instanceof GuardBool) {
		return (
			<Center>
				<Checkbox checked={value.toLowerCase() === "true"} variant="outline" readOnly />
			</Center>
		);
	}
	if (typeof value === "string" && field instanceof GuardDateTime) {
		const date = dayjs(value);
		return field.isDateOnly ? (
			<Text style={{ overflow: "clip", textWrap: "nowrap" }}>{date.format("YYYY/MM/DD")}</Text>
		) : (
			<Text style={{ overflow: "clip", textWrap: "nowrap" }}>{date.format("YYYY/MM/DD HH:mm")}</Text>
		);
	}

	const displayTest = field instanceof GuardEnum ? field._enumLabels[value] ?? value : value;
	return <Text style={{ overflow: "clip", textWrap: "nowrap" }}>{displayTest}</Text>;
}
