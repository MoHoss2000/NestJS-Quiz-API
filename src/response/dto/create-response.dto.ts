import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { ArrayDistinct } from '../../quiz/dto';

export class CreateResponseDto {
  @IsMongoId()
  quizId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  // @ValidateNested({ each: true })
  // @Type(() => String[])
  questionsAnswers: string[][];
}
