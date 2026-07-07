import { Controller, Post, Param, Body } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';

@Controller('api/v1/evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post(':attemptId/evaluate')
  async evaluateSubjective(
    @Param('attemptId') attemptId: string,
    @Body('answerText') answerText: string,
    @Body('expectedKeywords') expectedKeywords: string[],
  ) {
    return this.evaluationService.evaluateSubjectiveAnswer(attemptId, answerText, expectedKeywords);
  }
}
