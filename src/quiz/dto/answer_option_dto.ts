import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export class AnswerOptionDto {
  @IsString()
  @IsNotEmpty()
  answerText: string;

  @IsBoolean()
  isCorrect?: boolean = false;
}

export function ArrayDistinct(
  property: string,
  validationOptions?: ValidationOptions,
): Function {
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'ArrayDistinct',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (Array.isArray(value)) {
            const distinct = [
              ...new Set(value.map((v): Object => v[property])),
            ];
            return distinct.length === value.length;
          }
          return false;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must not contains duplicate entry for ${args.constraints[0]}`;
        },
      },
    });
  };
}
