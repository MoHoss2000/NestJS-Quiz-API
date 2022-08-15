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
}
