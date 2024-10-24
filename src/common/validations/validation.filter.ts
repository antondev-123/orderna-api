import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

export function IsValidDateString(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "isValidDateString",
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					if (typeof value !== "string") return false;
					const date = new Date(value);
					return (
						!isNaN(date.getTime()) && value === date.toISOString().split("T")[0]
					);
				},
				defaultMessage(args: ValidationArguments) {
					return "Date string ($value) is not a valid date.";
				},
			},
		});
	};
}

@ValidatorConstraint({ async: false })
export class MaxOptionsValidator implements ValidatorConstraintInterface {
	validate(options: any[], args: ValidationArguments) {
		const limit = (args.object as any).limit;
		return options.length <= limit;
	}

	defaultMessage(args: ValidationArguments) {
		const limit = (args.object as any).limit;
		return `You can only add up to ${limit} options.`;
	}
}

export function MaxOptions(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: MaxOptionsValidator,
		});
	};
}
