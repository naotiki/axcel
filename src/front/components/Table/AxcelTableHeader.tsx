import { useState } from "react";
import { Avatar, Popover, Text, Button, Group, Space } from "@mantine/core";
import { User } from "../../repo/UserRepository";
import { Changes, MapValueType, TableChangesRepository } from "../../repo/TableChangesRepository";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { GuardModelBase } from "@/library/guard/GuardModel";
import { IconTextWithTooltip } from "./IconTextWithTooltip";
import { hc } from "hono/client";
import { AxcelPost } from "@/api";
import { css } from "@emotion/css";
import { GuardValue } from "@/library/guard/GuardValue";
import { GuardRelation, GuardRelationList } from "@/library/guard/guard";

type AxcelTableHeaderProps<M extends GuardModelBase> = {
	model: M;
	user: User;
	users: User[];
	changes: Changes<M>;
	tableChangesRepo: TableChangesRepository<M>;
	locked: boolean;
	onLockedChange: (locked: boolean) => void;
};
export function AxcelTableHeader<M extends GuardModelBase>({
	model, user, users, changes, tableChangesRepo, ...props
}: AxcelTableHeaderProps<M>) {
	const [opened, { close, open }] = useDisclosure(false);
	const [showValidationErrorText, setShowValidationErrorText] = useState(false);
	return (
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
					color="yellow" />
				<IconTextWithTooltip
					icon={<IconPlus />}
					text={(Object.keys(changes?.addtions ?? {}).length ?? 0).toString()}
					tooltip={`追加 : ${(Object.keys(changes?.addtions ?? {}).length ?? 0).toString()} 行`}
					color="green" />
				<IconTextWithTooltip
					icon={<IconTrash />}
					text={(changes?.deletions.length ?? 0).toString()}
					tooltip={`削除 : ${changes?.deletions.length ?? 0} 行`}
					color="red" />
				<Popover opened={opened || showValidationErrorText} withArrow shadow="md" width={400} position="top">
					<Popover.Target>
						<Button
							onMouseEnter={open}
							onMouseLeave={close}
							loading={props.locked ?? false}
							disabled={!changes?.hasChanges()}
							onClick={async () => {
								props.onLockedChange(true);
								const changes = tableChangesRepo.getState();
								if (!changes?.hasChanges()) return;
								for (const [key, field] of Object.entries(model.modelSchema)) {
									const strings = Object.entries(changes.addtions)
										.map(([_, v]) => v[key as keyof M["modelSchema"]])
										.concat(
											Object.values(changes.changes)
												.filter((v) => v.column === key)
												.map((v) => v.new)
										);
									for (const value of strings) {
										if (field instanceof GuardValue &&field.validate(value as string | null | undefined)) {
											setShowValidationErrorText(true);
											setTimeout(() => {
												setShowValidationErrorText(false);
											}, 5000);
											props.onLockedChange(false);
											return;
										}
										if(field instanceof GuardRelation){
											//TODO
											//throw new Error("Not implemented");
										}
										if (field instanceof GuardRelationList) {
											throw new Error("Not implemented");
										}
									}
								}
								const result = await hc<AxcelPost>("http://localhost:8080/api").axcel[":model"].$post({
									param: {
										model: model.name,
									},
								});
								console.dir(result);
								props.onLockedChange(false);
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
	);
}
