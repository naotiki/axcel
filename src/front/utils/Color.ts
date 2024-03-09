import { number } from "zod";

export function getRandomColor() {
	const h=Math.random() * 360;
  const [r,g,b]=hslToRgb(h, 80, 40);
  return `#${(r<<16 | g<<8 | b).toString(16)}`;
}
function hslToRgb(hue: number, saturation: number, lightness: number) {
	const h = hue;
	let s = saturation;
	let l = lightness;
	s /= 100;
	l /= 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [255 * f(0), 255 * f(8), 255 * f(4)];
}
