import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';
import * as moment from 'moment';

@ValidatorConstraint({ async: false })
export class IsStartDateValidConstraint implements ValidatorConstraintInterface {
    validate(startDate: string, args: ValidationArguments) {
        const { endDate } = args.object as any;
        const now = moment().utc().startOf('day');

        if (moment(startDate).isBefore(now)) {
            return false;
        }

        if (endDate && moment(startDate).isAfter(moment(endDate))) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'startDate must be today or later and before endDate';
    }
}

export function IsStartDateValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsStartDateValidConstraint
        });
    };
}

@ValidatorConstraint({ async: false })
export class IsEndDateValidConstraint implements ValidatorConstraintInterface {
    validate(endDate: string, args: ValidationArguments) {
        const { startDate } = args.object as any;

        if (startDate && moment(endDate).isBefore(moment(startDate))) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'endDate must be after startDate';
    }
}

export function IsEndDateValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEndDateValidConstraint
        });
    };
}
