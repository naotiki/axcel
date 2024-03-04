import {
	ChangeEvent,
	PropsWithChildren,
	ReactNode,
	useCallback,
	useState,
} from "react";
import { ZodTypeAny } from "zod";
import { useTable } from "./TableProvider";
import {
	Input,
	Text,
	Table,
	TextInput,
	MantineStylesRecord,
} from "@mantine/core";
import * as React from "react";

type CellProps = {
	value?: string;
	zod: ZodTypeAny;
};
export function CellText({ ...props }: CellProps) {
	const ctx = useTable();

	const [editing, setEditing] = useState(false);
	const handleClick = () => {
		setEditing(true);
	};
	const [value, setValue] = useState(props.value);
	const a = useCallback<ChangeEvent<HTMLInputElement>>((e) => {
		const r=props.zod.safeParse(e.currentTarget.value)
		if (!r.success) {
			console.log(r.error.message)
		}
		setValue(e.currentTarget.value);
	}, [props.zod]);
	return (
		<Table.Td onClick={handleClick} style={editing?{
			border:"blue"
		}:{}}>
			{editing ? (
				<Input
					variant={"unstyled"}
					value={value ?? ""}
					onChange={a}
					pos={"relative"}
					style={{
						border:"blue"
					}}
					/*wrapperProps={{
						style: {
							maxwidth: "fit-content",
						} as MantineStylesRecord,
					}}*/
				/>
			) : (
				<Text>{value}</Text>
			)}
		</Table.Td>
	);
}
