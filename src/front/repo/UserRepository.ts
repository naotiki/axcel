import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { v4 as uuidv4 } from "uuid";
import { AbsoluteCellPosition, mockModel } from "../components/Table/TableDevTest";
import { GuardModel, GuardModelBase } from "@/library/guard/GuardModel";
type UserData = {
	_uid: string;
	name: string;
	color: string;
};
type UserCursor = {
	selectedCellId?: string;
	relativeCursorPos?: Y.RelativePosition;
};
type UserMetaData = {
	locked: boolean;
};
export type User = {
	user: UserData;
	cursor?: UserCursor;
	meta?: UserMetaData;
};

export function getRandomName() {
	const names = [
		"Alice",
		"Bob",
		"Charlie",
		"David",
		"Eve",
		"Frank",
		"Grace",
		"Hannah",
		"Ivan",
		"Jack",
		"Katie",
		"Liam",
		"Mia",
		"Nathan",
		"Olivia",
		"Peter",
		"Quinn",
		"Rachel",
		"Steve",
		"Tina",
		"Ursula",
		"Victor",
		"Wendy",
		"Xander",
		"Yvonne",
		"Zach",
	];
	return names[Math.floor(Math.random() * names.length)];
}

export class UserRepository {
	private awareness: awarenessProtocol.Awareness;
	private user: User;
	getUser(): Readonly<User> {
		return this.user;
	}
	constructor(awareness: awarenessProtocol.Awareness, user: { name: string; color: string }) {
		this.awareness = awareness;
		const u:Required<User> = {
			user: {
				_uid: uuidv4(),
				name: user.name,
				color: user.color,
			},
			cursor: {},
			meta: { locked: false },
		};
		this.user = u;
		this.updateUserData(u.user);
		this.updateUserCursor(u.cursor);
		this.updateUserMeta(u.meta);
	}

	updateUserData(userData: UserData) {
		this.awareness.setLocalStateField("user", { ...userData });
		this.user = {
			user: userData,
			cursor: this.user?.cursor ?? {},
			meta: this.user.meta,
		};
	}
	updateUserCursor(cursor: UserCursor) {
		this.awareness.setLocalStateField("cursor", { ...cursor });
		this.user = {
			user: this.user.user,
			cursor: cursor,
			meta: this.user.meta,
		};
	}
	updateUserMeta(meta: UserMetaData) {
		this.awareness.setLocalStateField("meta", { ...meta });
		this.user = {
			user: this.user.user,
			cursor: this.user.cursor,
			meta: meta,
		};
	}

	onUserChanged(
		callback: (users: User[], changeUIDs: { added: number[]; updated: number[]; removed: number[] }) => void,
	) {
		this.awareness.on(
			"change",
			(changes: { added: number[]; updated: number[]; removed: number[] }) => {
				this.user = this.awareness.getLocalState() as User;
				callback(this.getUsers(), changes);
			},
		);
	}
	getUserByNumber(number: number) {
		return this.awareness.getStates().get(number) as User;
	}
	getOtherUsers() {
		return this.getUsers().filter((u) => u.user._uid !== this.user.user._uid);
	}
	getUsers() {
		//APIからの接続は除外
		return Array.from(this.awareness.getStates().values()).filter(u=>u.user) as User[];
	}
}
