import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('recommendations/:studentId')
  async getRecommendations(@Param('studentId') studentId: string) {
    return this.jobsService.getRecommendedJobs(studentId);
  }

  @Post(':jobId/apply')
  async applyToJob(
    @Param('jobId') jobId: string,
    @Body('studentId') studentId: string,
  ) {
    return this.jobsService.applyToJob(studentId, jobId);
  }

  @Get(':jobId/leaderboard')
  async getLeaderboard(
    @Param('jobId') jobId: string,
  ) {
    return this.jobsService.getLeaderboard(jobId, true); // true = Blind Hiring Mode on by default
  }
}
