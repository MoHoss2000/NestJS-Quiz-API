import { ParseArrayPipe } from '@nestjs/common';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { AnswerOptionDto, ArrayDistinct } from './answer_option_dto';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsBoolean()
  @IsOptional()
  multipleAnswers?: boolean = false;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => AnswerOptionDto)
  @ArrayDistinct('answerText')
  options: AnswerOptionDto[];
}
