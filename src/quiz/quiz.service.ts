import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Console } from 'console';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionDto, CreateQuizDto, EditQuizDto } from './dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async getMyQuizzes(userId: string) {
    return await this.prisma.quiz.findMany({
      where: {
        userId,
      },
      orderBy: [{ published: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getQuizById(userId: string, quizId: string) {
    if (!isMongoId(quizId)) {
      throw new NotFoundException('Invalid id format');
    }

    const quiz = await this.prisma.quiz.findFirst({
      where: {
        userId: userId,
        id: quizId,
      },
      include: {
        questions: {
          select: {
            id: true,
            multipleAnswers: true,
            questionText: true,
            options: {
              select: {
                answerText: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        "Quiz not found or you don't have access to this resource",
      );
    }

    return quiz;
  }

  async addQuestion(userId: string, quizId: string, dto: QuestionDto) {
    if (!isMongoId(quizId)) {
      throw new NotFoundException('Invalid quiz id');
    }

    const correctOptions = dto.options.filter((option) => option.isCorrect);

    if (!dto.multipleAnswers && correctOptions.length != 1) {
      throw new ForbiddenException(
        'Single answer questions should have exactly one correct option',
      );
    }

    if (dto.multipleAnswers && correctOptions.length < 2) {
      throw new ForbiddenException(
        'Multiple answer questions should have more than one correct option',
      );
    }

    const quiz = await this.prisma.quiz.findFirst({
      where: {
        userId: userId,
        id: quizId,
      },

      select: {
        _count: true,
        published: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        "Quiz not found or you don't have access to this resource",
      );
    }

    if (quiz.published) {
      throw new ForbiddenException('You cannot edit a published quiz');
    }

    if (quiz._count.questions >= 10) {
      throw new ForbiddenException('Max number of questions (10) reached.');
    }

    return await this.prisma.question.create({
      data: {
        quizId,
        ...dto,
      },
    });
  }

  async editQuestion(
    userId: string,
    quizId: string,
    questionId: string,
    dto: QuestionDto,
  ) {
    if (!isMongoId(quizId)) {
      throw new NotFoundException('Invalid quiz id');
    }

    if (!isMongoId(questionId)) {
      throw new NotFoundException('Invalid question id');
    }

    const doc = await this.prisma.question.findFirst({
      where: {
        id: questionId,
      },
      include: { quiz: true },
    });

    if (!doc || doc.quiz.userId != userId) {
      throw new NotFoundException(
        "Question not found or your don't have access to this resource",
      );
    }

    if (doc.quiz.published) {
      throw new ForbiddenException('You cannot edit a published quiz');
    }

    return await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: { ...dto },
    });
  }

  async createQuiz(userId: string, dto: CreateQuizDto) {
    const quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        userId,
      },
    });

    return quiz;
  }

  async deleteQuestion(userId: string, quizId: string, questionId: string) {
    if (!isMongoId(quizId)) {
      throw new NotFoundException('Invalid quiz id');
    }

    if (!isMongoId(questionId)) {
      throw new NotFoundException('Invalid question id');
    }

    const doc = await this.prisma.question.findFirst({
      where: {
        id: questionId,
      },
      include: { quiz: true },
    });

    if (!doc || doc.quiz.userId != userId) {
      throw new NotFoundException(
        "Question not found or your don't have access to this resource",
      );
    }

    if (doc.quiz.published) {
      throw new ForbiddenException('You cannot edit a published quiz');
    }

    return await this.prisma.question.delete({
      where: {
        id: questionId,
      },
    });
  }

  private async validateQuizOwnership(userId: string, quizId: string) {
    if (!isMongoId(quizId)) {
      throw new NotFoundException('Invalid quiz id');
    }

    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
      },
    });

    if (!quiz || quiz.userId != userId) {
      throw new NotFoundException(
        "Quiz not found or your don't have access to this resource",
      );
    }

    return quiz;
  }

  async editQuiz(userId: string, quizId: string, dto: EditQuizDto) {
    const quiz = await this.validateQuizOwnership(userId, quizId);

    if (quiz.published) {
      throw new ForbiddenException('You cannot edit a published quiz');
    }

    return await this.prisma.quiz.update({
      where: {
        id: quizId,
      },
      data: { ...dto },
    });
  }

  async deleteQuiz(userId: string, quizId: string) {
    await this.validateQuizOwnership(userId, quizId);

    return await this.prisma.quiz.delete({
      where: {
        id: quizId,
      },
    });
  }
}
