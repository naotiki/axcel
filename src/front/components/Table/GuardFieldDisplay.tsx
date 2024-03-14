import {
	Center,
	Checkbox, Text
} from "@mantine/core";
import { GuardField } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";
import { GuardBool } from "../../../library/guard/values/GuardBool";
import React from "react";

type GuardFieldDisplayProps = {
	field: GuardField;
	value?: string | null | undefined;
};
export function GuardFieldDisplay({ field, value }: GuardFieldDisplayProps) {
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
