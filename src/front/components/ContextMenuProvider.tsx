import { css } from "@emotion/css";
import { Box } from "@mantine/core";
import { useClickOutside, useViewportSize } from "@mantine/hooks";
import {
	PropsWithChildren,
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

class ContextMenuService {
	listener?: (x: number, y: number, element: (close: () => void) => ReactNode) => void;
	open(x: number, y: number, element: (close: () => void) => ReactNode) {
		this.listener?.(x, y, element);
	}
	onOpen(listner: (x: number, y: number, element: (close: () => void) => ReactNode) => void) {
		this.listener = listner;
	}
}

const ContextMenuContext = createContext<ContextMenuService | null>(null);

export function useContextMenu<T extends HTMLElement>(
	menuElement: (close: () => void) => ReactNode,
	onOpened?: () => void,
) {
	const ref = useRef<T>(null);
	const ctx = useContext(ContextMenuContext);
	useEffect(() => {
		if (ref.current) {
			ref.current.oncontextmenu = (e) => {
				console.dir(e);
				ctx?.open(e.x, e.y, menuElement);
				onOpened?.();
				return false;
			};
		}
	}, [ctx, menuElement, onOpened]);
	return ref;
}

export function ContextMenuProvider({ children }: PropsWithChildren) {
	const ctx = useRef(new ContextMenuService());
	const [menu, setMenu] = useState<ReactNode | null>(null);
	const size = useViewportSize();
	const onClose = useCallback((_size?:{width:number,height:number}) => {
		setMenu(null);
	}, []);
	useEffect(() => {
		onClose(size);
	}, [size, onClose]);
	const ref = useClickOutside<HTMLDivElement>(onClose);
	useEffect(() => {
		ctx.current.onOpen((x, y, element) => {
			setMenu(
				<Box
					className={css({
						position: "absolute",
						top: y,
						left: x,
					})}
					ref={ref}
				>
					{element(onClose)}
				</Box>,
			);
		});
		return () => {
			ctx.current.listener = undefined;
		};
	}, [onClose, ref]);
	return (
		<ContextMenuContext.Provider value={ctx.current}>
			{children}

			{menu}
		</ContextMenuContext.Provider>
	);
}
