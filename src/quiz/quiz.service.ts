import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Console } from 'console';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, EditQuizDto } from './dto';

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

  async createQuiz(userId: string, dto: CreateQuizDto) {
    const quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        userId,
      },
    });

    return quiz;
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
