import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuizController } from './quiz/quiz.controller';
import { QuizModule } from './quiz/quiz.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    QuizModule,
    QuestionModule,
  ],
})
export class AppModule {}
