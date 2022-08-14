import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { QuestionDto, CreateQuizDto, EditQuizDto } from './dto';

import { QuizService } from './quiz.service';

@UseGuards(JwtGuard)
@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post()
  createQuiz(@GetUser('id') userId: string, @Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(userId, dto);
  }

  @Get(':quizId')
  getQuizById(@GetUser('id') userId: string, @Param('quizId') quizId: string) {
    return this.quizService.getQuizById(userId, quizId);
  }

  @Post(':quizId/questions')
  addQuestion(
    @GetUser('id') userId: string,
    @Param('quizId') quizId: string,

    @Body() dto: QuestionDto,
  ) {
    return this.quizService.addQuestion(userId, quizId, dto);
  }

  @Delete(':quizId/questions/:questionId')
  deleteQuestion(
    @GetUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizService.deleteQuestion(userId, quizId, questionId);
  }

  @Patch(':quizId/questions/:questionId')
  editQuestion(
    @GetUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() dto: QuestionDto,
  ) {
    return this.quizService.editQuestion(userId, quizId, questionId, dto);
  }

  @Get()
  getMyQuizzes(@GetUser('id') userId: string) {
    return this.quizService.getMyQuizzes(userId);
  }

  @Delete(':quizId')
  updateQuiz(
    @GetUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Body() dto: EditQuizDto,
  ) {
    return this.quizService.editQuiz(userId, quizId, dto);
  }

  @Delete(':quizId')
  deleteQuiz(@GetUser('id') userId: string, @Param('quizId') quizId: string) {
    return this.quizService.deleteQuiz(userId, quizId);
  }
}
