import { Module } from '@nestjs/common';
import { ProctoringController } from './proctoring.controller';
import { ProctoringService } from './proctoring.service';

@Module({
  controllers: [ProctoringController],
  providers: [ProctoringService]
})
export class ProctoringModule {}
