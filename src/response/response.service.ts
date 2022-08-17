import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnswerChoice,
  AnswerOption,
  prisma,
  Question,
  QuestionSolution,
  Quiz,
  QuizSolution,
} from '@prisma/client';
import { isMongoId } from 'class-validator';
import { combineLatest, identity, map, NotFoundError } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto';

@Injectable()
export class ResponseService {
  constructor(private prismaService: PrismaService) {}

  async addResponseOnQuiz(userId: string, dto: CreateResponseDto) {
    if (!isMongoId(dto.quizId))
      throw new ForbiddenException('Invalid quiz id format');

    const quiz: Quiz = await this.prismaService.quiz.findFirst({
      where: {
        id: dto.quizId,
        published: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        'Quiz not found or not published yet by the author',
      );
    }

    const quizSolution: QuizSolution =
      await this.prismaService.quizSolution.findFirst({
        where: {
          userId,
          quizId: dto.quizId,
        },
      });

    if (quizSolution)
      throw new ForbiddenException(
        'You have already submitted a response to this quiz before',
      );

    const quizQuestions: Question[] =
      await this.prismaService.question.findMany({
        where: {
          quizId: dto.quizId,
        },
      });

    if (dto.questionsAnswers.length !== quizQuestions.length)
      throw new ForbiddenException(
        'Number of questions submitted is not equal to the number of questions in the quiz',
      );

    var questionsAnswers: QuestionSolution[] = [];

    var quizScore: number = 0;
    quizQuestions.forEach((question, index) => {
      const userChosenOptions = dto.questionsAnswers[index];

      // console.log(userChosenOptions);
      // question has single answer
      // but multiple answers was chosen
      if (!question.multipleAnswers && userChosenOptions?.length > 1)
        throw new ForbiddenException(
          `Multiple options selected for a single answer question (at index ${index})`,
        );

      const options: AnswerChoice[] = question.options.map(
        (option: AnswerOption) => {
          const temp = { ...option };
          delete temp.isCorrect;
          const answerChoice = { ...temp, isChosen: null } as AnswerChoice;
          if (userChosenOptions.includes(option.answerText)) {
            answerChoice.isChosen = true;
          } else answerChoice.isChosen = false;
          return answerChoice;
        },
      );

      var questionScore: number = 0;
      if (userChosenOptions.length === 0) questionScore = 0;
      else {
        // console.log(question.options.filter((option) => option.isCorrect));
        const correctOptions: string[] = question.options
          .filter((option) => option.isCorrect)
          .map((option) => option.answerText);

        if (question.multipleAnswers) {
          const noOfOptions = question.options.length;
          const noOfCorrectOptions = correctOptions.length;
          const noOfWrongOptions = noOfOptions - noOfCorrectOptions;

          const weightRight = 1 / noOfCorrectOptions;
          const weightWrong = 1 / noOfWrongOptions;

          userChosenOptions.forEach((chosenOption) => {
            const query = question.options.filter(
              (questionOption) => questionOption.answerText === chosenOption,
            );

            if (query.length == 0)
              throw new ForbiddenException(
                `Invalid answer to a submitted question (at index ${index})`,
              );

            if (correctOptions.includes(chosenOption))
              questionScore += weightRight;
            else questionScore -= weightWrong;
          });
        } else {
          // single answer question
          const query = question.options.filter(
            (questionOption) =>
              questionOption.answerText === userChosenOptions[0],
          );
          if (query.length == 0)
            throw new ForbiddenException(
              `Invalid answer to a submitted question (at index ${index})`,
            );
          if (userChosenOptions[0] === correctOptions[0]) questionScore = 1;
          else questionScore = -1;
        }
      }

      quizScore += questionScore;

      questionsAnswers.push({
        questionId: question.id,
        chosenAnswers: options,
        questionScore,
        questionText: question.questionText,
      });
    });

    return await this.prismaService.quizSolution.create({
      data: {
        quizId: dto.quizId,
        userId,
        questionsAnswers: questionsAnswers,
        quizScore: quizScore,
      },
    });
  }

  async getUserResponses(userId: string) {
    return await this.prismaService.quizSolution.findMany({
      where: {
        userId,
      },
    });
  }

  async getResponseById(userId: string, responseId: string) {
    if (!isMongoId(responseId)) {
      throw new NotFoundException('Invalid quiz id');
    }

    const query = await this.prismaService.quizSolution.findMany({
      where: {
        userId,
        id: responseId,
      },
    });

    if (query.length == 0) throw new NotFoundException('Response not found');
    else return query[0];
  }
}
