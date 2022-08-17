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
        id: quizId,
      },
      include: {
        questions: {
          select: {
            id: true,
            multipleAnswers: true,
            options: true,
            questionText: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    // this is the author of the quiz
    // allow to see correct answers
    if (quiz.userId == userId) return quiz;
    else {
      quiz.questions.forEach((question) => {
        question.options.forEach((option) => {
          delete option.isCorrect;
        });
      });

      return quiz;
    }
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

    const quizQuestions = await this.prisma.question.count({
      where: {
        quizId,
      },
    });

    if (quizQuestions < 1 || quizQuestions > 10) {
      throw new ForbiddenException('Quizzes must have from 1 to 10 questions');
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

  async getQuizResponses(userId: string, quizId: string, pageNo: number) {
    await this.validateQuizOwnership(userId, quizId);

    if (pageNo < 1) throw new ForbiddenException('pageNo must be 1 or greater');

    const totalCount = await this.prisma.quizSolution.count();

    const docs = await this.prisma.quizSolution.findMany({
      skip: (pageNo - 1) * 10,
      take: 10,
      where: {
        quizId,
      },
    });

    return {
      pageNo: pageNo,
      count: docs.length,
      totalCount,
      data: [...docs],
    };
  }

  async getQuizResponseById(
    userId: string,
    quizId: string,
    responseId: string,
  ) {
    await this.validateQuizOwnership(userId, quizId);

    return await this.prisma.quizSolution.findUnique({
      where: {
        id: responseId,
      },
    });
  }
}
