import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  getAll(
    @Query('pageNo', new DefaultValuePipe(1), ParseIntPipe) pageNo: number,
  ) {
    return this.testService.getAll(pageNo);
  }

  @Post()
  createMany() {
    return this.testService.createMany();
  }
}
