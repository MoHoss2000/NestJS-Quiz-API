import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { AddQuestionDto, EditQuestionDto } from '../quiz/dto';
import { QuestionService } from './question.service';

@UseGuards(JwtGuard)
@Controller('question')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post()
  addQuestion(@GetUser('id') userId: string, @Body() dto: AddQuestionDto) {
    return this.questionService.addQuestion(userId, dto);
  }

  @Delete(':questionId')
  deleteQuestion(
    @GetUser('id') userId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.questionService.deleteQuestion(userId, questionId);
  }

  @Patch(':questionId')
  editQuestion(
    @GetUser('id') userId: string,
    @Param('questionId') questionId: string,
    @Body() dto: EditQuestionDto,
  ) {
    return this.questionService.editQuestion(userId, questionId, dto);
  }
}
