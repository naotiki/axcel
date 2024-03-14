import {
	Center,
	Checkbox,
	NativeSelect,
	NumberInput, TextInput
} from "@mantine/core";
import { DatePickerInput, DateTimePicker } from "@mantine/dates";
import { GuardField } from "../../../library/guard/guard";
import { GuardEnum } from "../../../library/guard/values/GuardEnum";
import { GuardBool } from "../../../library/guard/values/GuardBool";
import { GuardDateTime } from "../../../library/guard/values/GuardDateTime";
import { GuardInt, GuardNumbers } from "../../../library/guard/values/GuardNumbers";
import React from "react";

type GuardFieldInputProps = {
	field: GuardField;
	value?: string;
	onValueChange: (v: string) => void;
};
export function GuardFieldInput({ field, value, ...props }: GuardFieldInputProps) {
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
				onChange={(e) => props.onValueChange(e.currentTarget.value)} />
		);
	}
	if (field instanceof GuardBool) {
		return (
			<Center>
				<Checkbox
					checked={value?.toLowerCase() === "true"}
					onChange={(e) => props.onValueChange(e.currentTarget.checked.toString())} />
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
					onChange={(d) => props.onValueChange(d?.toLocaleDateString() ?? "")} />
			);
		}
		return (
			<DateTimePicker
				valueFormat="YYYY年MM月DD日 HH:MM"
				autoFocus
				value={value ? new Date(value) : null}
				onChange={(d) => props.onValueChange(d?.toLocaleString() ?? "")} />
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
				onChange={(e) => props.onValueChange(e.toString())} />
		);
	}

	return (
		<TextInput
			autoFocus
			size="100%"
			variant="unstyled"
			value={value}
			onChange={(e) => props.onValueChange(e.currentTarget.value)} />
	);
}
