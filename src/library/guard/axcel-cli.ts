#!/usr/bin/env bun
import { $ } from "bun";
import { program } from "commander";
import gradient from "gradient-string";
import type { Axcel } from "./GuardGenerator";

const axcel = gradient("red", "orange")("Axcel");
const axcelCli = gradient("red", "orange")("Axcel CLI");
program.name(axcelCli).description(`CLI for ${axcel}`).version("0.0.1");
program
	.command("about")
	.description(`About ${axcel}`)
	.action(() => {
		console.log(`Welcome to ${axcelCli}`);

		console.log("created by Naotiki");
	});
program
	.command("generate")
	.description(`Generate Prisma Schema from ${axcel} Schema`)
	.argument("<schema>", `${axcel} Schema file path`)
  .option("-o, --output <output>", "Output Prisma Schema file")
  .action(async (schema, options) => {
		
    const axcelInst:Axcel|undefined = (await import(Bun.resolveSync(schema,process.cwd()))).default
	
		if (!axcelInst||axcelInst?.models?.length === 0) {
			console.error(`❌️ Invalid ${axcel} schema file`);
			return;
		}
		const out=options.output??"prisma/schema.prisma"
    axcelInst.generate(Bun.file(out));
		const schemaAbsolutePath=Bun.fileURLToPath(Bun.pathToFileURL(options.output??"prisma/schema.prisma"))
		console.log(`✅️ Prisma schema generated to ${schemaAbsolutePath}`);
		const command=`prisma generate --schema ${schemaAbsolutePath}`
		console.log(`Run \`${command}\` to generate Prisma Client\n`);
		console.log(`$ ${command}`);
		
    await $`${Bun.argv[0]} prisma generate --schema ${schemaAbsolutePath}`
		
  });
program.parse(Bun.argv);
