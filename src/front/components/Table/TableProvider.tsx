import { useCallback, useMemo, useRef, useState } from "react";
import { css } from "@emotion/css";
import { v4 as uuidv4 } from "uuid";
import { Box, Button, Stack, Loader, LoadingOverlay, Container, ScrollArea } from "@mantine/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { User, UserRepository } from "../../repo/UserRepository";
import { getRandomColor } from "../../utils/Color";
import { Changes, TableMapType, TableChangesRepository } from "../../repo/TableChangesRepository";
import { GuardValue } from "../../../library/guard/GuardValue";
import { useShallowEffect } from "@mantine/hooks";
import { IconTablePlus } from "@tabler/icons-react";
import {
	GuardModelBase,
	GuardModelInput,
	GuardModelOutput,
	GuardModelOutputWithId,
	GuardModelSort,
} from "@/library/guard/GuardModel";
import { useUser } from "../UserProvider";
import { hc } from "hono/client";
import { AxcelGet } from "@/api";
import { AxcelTableHeader } from "./AxcelTableHeader";
import { AxcelTable } from "./AxcelTable";

type TableProviderProps<M extends GuardModelBase> = {
	model: M;
};

//type CellLocation = AbsoluteCellPosition<typeof mockModel>;

export function AxcelTableView<M extends GuardModelBase>({ model, ...props }: TableProviderProps<M>) {
	const userRepo = useRef<UserRepository>();
	const tableChangesRepo = useRef<TableChangesRepository<M>>();
	const [user, setUser] = useState<User>();
	const [users, setUsers] = useState<User[]>([]);
	const authUser = useUser();
	const [changes, setChanges] = useState<Changes<M>>();
	const [locked, setLocked] = useState<boolean>(false);
	const lastUpdated = useRef<number>();
	const [data, setData] = useState<GuardModelOutputWithId<M>[]>();
	const [sort, setSort] = useState(
		Object.fromEntries(model.getIdEntries().map(([k]) => [k, "asc"])) as GuardModelSort<M>,
	);
	const fetch = async () => {
		console.log(sort);
		const res = await hc<AxcelGet>(`${import.meta.env.VITE_APP_URL}/api`).axcel[":model"].$get({
			param: { model: model.name },
			query: { ...sort },
		});
		const data = await res.json();
		if (Array.isArray(data)) {
			setData(model.injectIdList(data as GuardModelOutput<M>[]));
			lastUpdated.current = Date.now();
		}
	};

	useShallowEffect(() => {
		const doc = new Y.Doc();
		const wsProvider = new WebsocketProvider(`${import.meta.env.VITE_APP_WS}/api/yws`, model.name, doc);
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
		console.log(sort);
		tableChangesRepo.current = new TableChangesRepository<M>(doc);
		tableChangesRepo.current.onChanges((type) => {
			if (tableChangesRepo.current !== undefined) {
				const meta = tableChangesRepo.current.getMetaData();
				setLocked(meta.locked ?? false);
				setChanges(tableChangesRepo.current.getState());
			}
		});
		return () => {
			wsProvider.destroy();
		};
	}, [authUser.name, model]);
	useShallowEffect(() => {
		fetch();
		const callback = () => {
			const meta = tableChangesRepo.current?.getMetaData();
			if (meta?.updatedAt && lastUpdated.current && meta.updatedAt > lastUpdated.current) {
				fetch();
			}
		};
		tableChangesRepo.current?.onChanges(callback);
		return () => {
			tableChangesRepo.current?.removeCallback(callback);
		};
	}, [sort, tableChangesRepo.current]);
	if (!user || !users || !changes || !data || !tableChangesRepo.current || !userRepo.current)
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
		<Box pos={"relative"}>
			<LoadingOverlay visible={locked} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
			<Container size={"md"}>
				<AxcelTableHeader
					model={model}
					changes={changes}
					user={user}
					users={users}
					tableChangesRepo={tableChangesRepo.current}
					locked={locked}
					onLockedChange={(locked) => setLocked(locked)}
				/>
			</Container>
			<ScrollArea maw={"100vw"} px={"2vw"} offsetScrollbars>
				{
					<AxcelTable
						model={model}
						data={data}
						changes={changes}
						user={user}
						users={users}
						tableChangesRepo={tableChangesRepo.current}
						userRepo={userRepo.current}
						locked={locked}
						sort={sort}
						onSortChanged={(sort) => setSort(sort)}
					/>
				}
			</ScrollArea>
			<Box maw={"100vw"} px={"2vw"}>
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
							) as { [K in keyof GuardModelInput<M>]: TableMapType },
						);
					}}
				>
					データを追加
				</Button>
			</Box>
		</Box>
	);
}
