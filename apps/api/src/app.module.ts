import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ExamsModule } from './exams/exams.module';
import { ProctoringModule } from './proctoring/proctoring.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    JobsModule, 
    ExamsModule, 
    ProctoringModule, 
    EvaluationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
