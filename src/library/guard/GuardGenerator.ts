import { GuardString } from "./values/GuardString";
import { GuardBool } from "./values/GuardBool";
import { GuardDecimal, GuardFloat, GuardInt } from "./values/GuardNumbers";
import { GuardEnum } from "./values/GuardEnum";
import { GuardDateTime } from "./values/GuardDateTime";
import { GuardModel, GuardModelBase, GuardModelColumn, GuardSchema } from "./GuardModel";
import { GuardList } from "./values/GuardList";
import { GuardValue } from "./GuardValue";
import { BunFile } from "bun";
import { GuardValueAny, GuardRelation, GuardRelationList, GuardField, PrismaType } from "./guard";
import { DefaultValueProvider } from "./ValueProviders";

export class Axcel {
	headerContent?: string;
	prismaHeader(content: string) {
		this.headerContent = content;
	}
	generate(to: BunFile) {
		const w = to.writer();
		if (this.headerContent) {
			w.write(`${this.headerContent}\n`);
		}
		for (const model of this.models) {
			model.check();
			const addContents: string[] = [];
			// to Modelname
			w.write(`model ${model.name[0].toUpperCase() + model.name.slice(1)} {\n`);
			for (const k in model.modelSchema) {
				const field = model.modelSchema[k];
				if (field instanceof GuardRelation) {
					w.write(`\t${k}    ${field.model.name[0].toUpperCase() + field.model.name.slice(1)}`);
					w.write(
						` @relation(fields: [${Object.keys(field.fields).join(", ")}],references: [${field.relations.join(
							", ",
						)}])`,
					);
					for (const relationField in field.fields) {
						w.write("\n");
						const relationFieldContent = field.fields[relationField];
						w.write(
							`\t${relationField}    ${relationFieldContent.prismaType}${
								relationFieldContent._optional ? "?" : ""
							}`,
						);
					}
				} else if (field instanceof GuardRelationList) {
					w.write(`\t${k}    ${field.model.name[0].toUpperCase() + field.model.name.slice(1)}[]`);
				} else if (field instanceof GuardValue) {
					let typeName: string = field.prismaType;
					if (field instanceof GuardEnum) {
						typeName = field.name;
						let str = `enum ${field.name} {\n\t`;
						str += field.enumValues.join("\n\t");
						str += "\n}\n";
						addContents.push(str);
					}
					w.write(`\t${k}    ${typeName}${field._optional ? "?" : ""}`);
					if (field._id) {
						w.write(" @id");
					}
					if (field._unique) {
						w.write(" @unique");
					}

					if (field instanceof GuardDateTime && field._updatedAt) {
						w.write(" @updatedAt");
					} else if (field._default) {
						if (typeof field._default !== "object") {
							if (typeof field._default === "string") {
								w.write(` @default("${field._default}")`);
							} else w.write(` @default(${field._default})`);
						} else {
							w.write(` @default(${(field._default as DefaultValueProvider<GuardValueAny>).expression})`);
						}
					}
				}
				w.write("\n");
			} //loop end field

			// Search references to this model
			for (const m of this.models) {
				if (model === m) continue; //同じのは除外
				for (const k in m.modelSchema) {
					const f = m.modelSchema[k];
					if ((f instanceof GuardRelation || f instanceof GuardRelationList) && f.model === model) {
						w.write(`\t${m.name.toLowerCase()}    ${m.name[0].toUpperCase() + m.name.slice(1)}[]\n`);
					}
				}
			}

			w.write("}\n");
			for (const addContent of addContents) {
				w.write(`\n${addContent}\n`);
			}
		} //loop end model
		w.end();
	}
	models: GuardModel<string, { [A in string]: GuardField }>[];
	constructor() {
		this.models = [];
	}
	list<T extends GuardValue<E>, E extends {}>(field: T) {
		return new GuardList<T, E>(field);
	}
	string() {
		return new GuardString();
	}
	bool() {
		return new GuardBool();
	}
	int() {
		return new GuardInt();
	}
	float() {
		return new GuardFloat();
	}
	decimal() {
		return new GuardDecimal();
	}
	dateTime() {
		return new GuardDateTime();
	}
	enum<S extends string, T extends [S, ...S[]]>(enumName: string, enumValues: T): GuardEnum<T[number]> {
		return new GuardEnum<T[number]>(enumName, enumValues);
	}
	relation<M extends GuardModelBase>(
		model: M,
		fields: Record<string, GuardValueAny>,
		relations: GuardModelColumn<M>[],
	) {
		return new GuardRelation(model, fields, relations);
	}
	relationList<T extends string, S extends GuardSchema<T>>(model: GuardModel<T, S>) {
		return new GuardRelationList(model);
	}
	model<T extends string, S extends GuardSchema<T>>(modelName: Lowercase<string>, schema: S) {
		const gm = new GuardModel<T, S>(modelName, schema);
		this.models.push(gm);
		return gm;
	}
}
