import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
