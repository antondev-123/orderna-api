
// TODO: Check if can be removed
//       Was used in auth.controller.ts, but unwanted values should be caught by the validators already
export function trimObjectValues(obj: any): any {
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	const trimmedObj: any = {};

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key];

			if (typeof value === "object" && value !== null) {
				trimmedObj[key] = this.trimObjectValues(value);
			} else if (typeof value === "string") {
				trimmedObj[key] = value.trim();
			} else {
				trimmedObj[key] = value;
			}
		}
	}

	return trimmedObj;
}
