import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { response } from 'express';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { CreateQuizDto, EditQuizDto } from './dto';

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

  @Get()
  getMyQuizzes(@GetUser('id') userId: string) {
    return this.quizService.getMyQuizzes(userId);
  }

  @Patch(':quizId')
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

  @Get(':quizId/responses')
  getQuizResponses(
    @GetUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Query('pageNo', new DefaultValuePipe(1), ParseIntPipe) pageNo: number,
  ) {
    return this.quizService.getQuizResponses(userId, quizId, pageNo);
  }

  @Get(':quizId/responses/:responseId')
  getQuizResponseById(
    @GetUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Param('responseId') responseId: string,
  ) {
    return this.quizService.getQuizById(userId, quizId);
  }
}
