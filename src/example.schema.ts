import { Axcel } from "./library/guard/GuardGenerator";

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
