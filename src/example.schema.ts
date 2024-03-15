import { Axcel } from "./library/guard/GuardGenerator";
import { autoIncrement, now } from "./library/guard/ValueProviders";

const a = new Axcel();



a.prismaHeader(`
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
	provider        = "prisma-client-js"
}
`);
export default a;
