import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('response')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Post()
  createQuizResponse(
    @GetUser('id') userId: string,
    @Body() createResponseDto: CreateResponseDto,
  ) {
    return this.responseService.addResponseOnQuiz(userId, createResponseDto);
  }

  @Get()
  getUserResponses(@GetUser('id') userId: string) {
    return this.responseService.getUserResponses(userId);
  }

  @Get(':responseId')
  getResponseById(
    @GetUser('id') userId: string,
    @Param('responseId') responseId: string,
  ) {
    return this.responseService.getResponseById(userId, responseId);
  }
}
