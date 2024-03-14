export type Attributes = {
	label?: string;
	description?: string;
};
export abstract class NameWithAttributes {
  name:string;
	attrs: Attributes = {};
  constructor(name: string) {
    this.name = name;
  }
  dispName(){
    return this.attrs.label??this.name;
  }
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
