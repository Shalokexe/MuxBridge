import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ProctoringService } from './proctoring.service';

@Controller('api/v1/proctoring')
export class ProctoringController {
  constructor(private readonly proctoringService: ProctoringService) {}

  @Post(':attemptId/events')
  async logProctoringEvent(
    @Param('attemptId') attemptId: string,
    @Body('eventType') eventType: string,
    @Body('severity') severity: string,
    @Body('details') details: any,
  ) {
    return this.proctoringService.logEvent(attemptId, eventType, severity, details);
  }

  @Get(':attemptId/audit')
  async getAuditLog(@Param('attemptId') attemptId: string) {
    return this.proctoringService.getAuditLedger(attemptId);
  }
}
