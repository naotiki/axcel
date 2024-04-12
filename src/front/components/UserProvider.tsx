import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Box, Center, Loader, Stack } from "@mantine/core";
import type { User } from "@/auth/AuthProvider";
import { authProvider } from "@/frontExport";
const UserContext = createContext<User | null>(null);

export function useUser() {
	return useContext(UserContext) as User;
}

export function UserProvider({ children }: PropsWithChildren) {
	const { user, status } = authProvider.useUserBySession();
  const [statusText,setStatusText]=useState("読み込み中")
	useEffect(() => {
		if (status === "unauthenticated") {
      setStatusText("リダイレクト中")
			authProvider.signIn();
		}
	}, [status]);
	if (status !== "authenticated") {
		return (
				<Stack align="center" justify="center" style={{
					height: "100vh",
				}}>
          {statusText}
					<Loader size={"xl"} />
				</Stack>
		);
	}
	return <UserContext.Provider value={user ?? null}>{children}</UserContext.Provider>;
}
