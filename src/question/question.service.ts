import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AddQuestionDto, EditQuestionDto } from '../quiz/dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async addQuestion(userId: string, dto: AddQuestionDto) {
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
        id: dto.quizId,
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
        ...dto,
      },
    });
  }

  async editQuestion(userId: string, questionId: string, dto: EditQuestionDto) {
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

  async deleteQuestion(userId: string, questionId: string) {
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
}
