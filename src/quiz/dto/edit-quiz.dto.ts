import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
