import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { v4 as uuidv4 } from "uuid";
import { AbsoluteCellPosition, mockModel } from "../components/Table/TableDevTest";
type UserData = {
	_uid: string;
	name: string;
	color: string;
};
type UserCursor = {
	selectedCell?: AbsoluteCellPosition<typeof mockModel>;
	relativeCursorPos?: Y.RelativePosition;
};
export type User = {
	user: UserData;
	cursor: UserCursor;
};

export function getRandomName(){
	const names = ["Alice","Bob","Charlie","David","Eve","Frank","Grace","Hannah","Ivan","Jack","Katie","Liam","Mia","Nathan","Olivia","Peter","Quinn","Rachel","Steve","Tina","Ursula","Victor","Wendy","Xander","Yvonne","Zach"];
	return names[Math.floor(Math.random()*names.length)];
}

export class UserRepository {
	awareness: awarenessProtocol.Awareness;
	private user: User;
	getUser():Readonly<User> {
		return this.user;
	}
	constructor(awareness: awarenessProtocol.Awareness, user: { name: string; color: string }) {
		this.awareness = awareness;
		this.user = {
			user: {
				_uid: uuidv4(),
				name: user.name,
				color: user.color,
			},
			cursor: {},
		};
		this.updateUserData(this.user.user);
		this.updateUserCursor(this.user.cursor);
	}

	updateUserData(userData: UserData) {
		this.awareness.setLocalStateField("user", { ...userData });
		this.user = {
			user: userData,
			cursor: this.user?.cursor ?? {},
		};
	}
	updateUserCursor(cursor: UserCursor) {
		this.awareness.setLocalStateField("cursor", { ...cursor });
		this.user = {
			user: this.user.user,
			cursor: cursor,
		};
	}

	onUserChanged(callback: (users:User[],changeUIDs: { added: number[]; updated: number[]; removed: number[] }) => void) {
		this.awareness.on(
			"change",
			(changes: { added: number[]; updated: number[]; removed: number[] }, transactionOrigin: unknown) => {
				// Whenever somebody updates their awareness information,
				// we log all awareness information from all users.
				//	console.log(Array.from())
				callback(this.getUsers(),changes);
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
		return Array.from(this.awareness.getStates().values()) as User[];
	}
}
