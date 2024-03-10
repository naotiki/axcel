import { User } from "@auth/core/types";
import { signIn, useSession } from "@hono/auth-js/react";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Box, Center, Loader, Stack } from "@mantine/core";
const UserContext = createContext<User | null>(null);

export function useUser() {
	return useContext(UserContext) as User;
}

export function UserProvider({ children }: PropsWithChildren) {
	const { data: session, status } = useSession();
  const [statusText,setStatusText]=useState("読み込み中")
	useEffect(() => {
		if (status === "unauthenticated") {
      setStatusText("リダイレクト中")
			signIn("keycloak");
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
	return <UserContext.Provider value={session.user ?? null}>{children}</UserContext.Provider>;
}
