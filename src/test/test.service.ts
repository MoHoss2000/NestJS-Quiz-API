import { ForbiddenException, Injectable } from '@nestjs/common';
import { Test } from '@prisma/client';
import { isInt } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async createMany() {
    return await this.prismaService.test.createMany({
      data: Array(10000).fill({
        text: 'hello',
      }),
    });
  }

  async getAll(pageNo: number) {
    if (pageNo < 1) throw new ForbiddenException('pageNo must be 1 or greater');
    console.log(pageNo);
    const totalCount = await this.prismaService.test.count();

    const docs = await this.prismaService.test.findMany({
      skip: (pageNo - 1) * 10,
      take: 10,
    });

    return {
      pageNo: pageNo,
      count: docs.length,
      totalCount,
      data: [...docs],
    };
  }
}
