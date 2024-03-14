import { createContext, useContext, useEffect, useRef, useState } from "react";
import { TableManager } from "../../model/TableManager";
import { ZodTypeAny } from "zod";
import { css } from "@emotion/css";
import { v4 as uuidv4 } from "uuid";
import { Box, Button, Stack, Loader } from "@mantine/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { User, UserRepository } from "../../repo/UserRepository";
import { getRandomColor } from "../../utils/Color";
import {
	Changes,
	MapValueType,
	TableChangesRepository,
} from "../../repo/TableChangesRepository";
import { GuardValue } from "../../../library/guard/GuardValue";
import { useShallowEffect } from "@mantine/hooks";
import { IconTablePlus } from "@tabler/icons-react";
import {
	GuardModelBase,
	GuardModelInput,
	GuardModelOutput,
	GuardModelOutputWithId,
} from "@/library/guard/GuardModel";
import { useUser } from "../UserProvider";
import { hc } from "hono/client";
import { AxcelGet } from "@/api";
import { Prisma } from "@prisma/client";
import { AxcelTableHeader } from "./AxcelTableHeader";
import { AxcelTable } from "./AxcelTable";
const TableContext = createContext<TableManager | null>(null);
//Wrapper
export function useTable() {
	const ctx = useContext(TableContext);
	if (!ctx) {
		throw new Error("TableContext not found. the TableElement must be surrounded by <TableProvider>");
	}
	return ctx;
}





export type Row = {
	name: string;
	type: ZodTypeAny;
};
type TableProviderProps<M extends GuardModelBase> = {
	model: M;
};

//type CellLocation = AbsoluteCellPosition<typeof mockModel>;

export function TableProvider<M extends GuardModelBase>({ model, ...props }: TableProviderProps<M>) {
	const userRepo = useRef<UserRepository>();
	const tableChangesRepo = useRef<TableChangesRepository<M>>();
	const [user, setUser] = useState<User>();
	const [users, setUsers] = useState<User[]>([]);
	const authUser = useUser();
	const [changes, setChanges] = useState<Changes<M>>();
	const [locked, setLocked] = useState<boolean>(false);
	const lastUpdated = useRef<number>();
	const [data, setData] = useState<GuardModelOutputWithId<M>[]>();
	useShallowEffect(() => {
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
			if (tableChangesRepo.current !== undefined) {
				const meta = tableChangesRepo.current.getMetaData();
				setLocked(meta.locked ?? false);
				setChanges(tableChangesRepo.current.getState());
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
		return () => {
			wsProvider.destroy();
		}
	}, [authUser.name,model]);
	if (!user || !users || !changes || !data || !tableChangesRepo.current || !userRepo.current || locked)
		return (
			<Stack
				align="center"
				justify="center"
				style={{
					height: "100%",
				}}
			>
				読み込み中
				<Loader size={"xl"} />
			</Stack>
		);
	return (
		<Box maw={"100%"}>
			<AxcelTableHeader
				model={model}
				changes={changes}
				user={user}
				users={users}
				tableChangesRepo={tableChangesRepo.current}
				locked={locked}
				onLockedChange={(locked) => setLocked(locked)}
			/>
			<div
				className={css({
					overflowX: "visible",
					maxWidth: "100%",
				})}
			>
				{
					<AxcelTable
						model={model}
						data={data}
						changes={changes}
						user={user}
						users={users}
						tableChangesRepo={tableChangesRepo.current}
						userRepo={userRepo.current}
					/>
				}
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

