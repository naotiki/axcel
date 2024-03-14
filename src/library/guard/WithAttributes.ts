export type Attributes = {
	label?: string;
	description?: string;
};
export abstract class WithAttributes {
	attrs: Attributes = {};
	label(label: string) {
		this.attrs.label = label;
		return this;
	}
	desc(description: string) {
		this.attrs.description = description;
		return this;
	}
	anotate(annotations: Attributes) {
		this.attrs = annotations;
		return this;
	}
}
