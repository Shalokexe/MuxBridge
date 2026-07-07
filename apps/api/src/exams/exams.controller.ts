import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('api/v1/exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('start-demo')
  async startDemoExam() {
    return this.examsService.startDemoExam();
  }

  @Get(':jobId/questions/:studentId')
  async getQuestions(
    @Param('jobId') jobId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.examsService.generateExamQuestions(jobId, studentId);
  }

  @Post(':jobId/start')
  async startExam(
    @Param('jobId') jobId: string,
    @Body('studentId') studentId: string,
  ) {
    return this.examsService.startExam(jobId, studentId);
  }
}
