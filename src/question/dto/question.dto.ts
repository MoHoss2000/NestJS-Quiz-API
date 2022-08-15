import { ParseArrayPipe } from '@nestjs/common';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { AnswerOptionDto, ArrayDistinct } from '../../quiz/dto';

export class EditQuestionDto {
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

export class AddQuestionDto extends EditQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  quizId: string;
}
