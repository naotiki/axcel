import { Env, MiddlewareHandler } from "hono";
import {
	GuardFieldInfer,
	GuardModelBase,
	GuardModelInput,
	GuardRelationRef,
} from "../GuardModel";
import { validator } from "hono/validator";
import { GuardValue } from "../GuardValue";
import { GuardRelation, GuardRelationList } from "../guard";
type GuardInput<T extends GuardModelBase> = {
	in: {
		json: GuardModelInput<T>;
	};
	out: {
		json: GuardModelInput<T>;
	};
};
//type ExcludeResponseType<T> = T extends Response & TypedResponse<any> ? never : T;
export function gValidator<T extends GuardModelBase, E extends Env, P extends string>(
	model: T,
): MiddlewareHandler<E, P, GuardInput<T>> {
	return validator<
	GuardModelInput<T>,
		P,
		"json",
		"json",
		GuardModelInput<T>|{success:true,error:string},//ValidationTargets["json"],
		GuardModelInput<T>|{success:true,error:string},//ExcludeResponseType<ValidationTargets["json"]>,
		P,
		GuardInput<T>
	>("json", (value: GuardModelInput<T>, c) => {
		for (const [key, field] of Object.entries(model.modelSchema)) {
			const targetValue = value[key as keyof typeof value];
			if (
				targetValue === undefined &&
				((field instanceof GuardValue && field._default !== true && field._optional !== true) ||
					!(field instanceof GuardValue))
			) {
				return c.json(
					{
						success: false,
						error: `field ${key}: is undefined`,
					},
					400,
				);
			}
			if (field instanceof GuardRelation) {
				if ((targetValue as GuardRelationRef<typeof field>).ref === undefined) {
					return c.json(
						{
							success: false,
							error: `field ${key}: ref is undefined`,
						},
						400,
					);
				}
			}
			if (field instanceof GuardRelationList) {
				if (!Array.isArray(targetValue)) {
					return c.json(
						{
							success: false,
							error: `field ${key}: expected Array but not Array`,
						},
						400,
					);
				}
				for (const r of targetValue as GuardRelationRef<typeof field>) {
					if (r.ref === undefined) {
						return c.json(
							{
								success: false,
								error: `field ${key}: ref is undefined`,
							},
							400,
						);
					}
				}
			}
			if (field instanceof GuardValue) {
				const v = targetValue as GuardFieldInfer<typeof field>;
				const err = field.validate(v);
				if (err) {
					return c.json(
						{
							success: false,
							error: `field ${key}: validation error \n${err.join("\n")}`,
						},
						400,
					);
				}
			}
		}
		return value;
	});
}
