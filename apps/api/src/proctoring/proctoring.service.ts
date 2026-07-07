import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProctoringService {
  constructor(private prisma: PrismaService) {}

  // The Trust Score determines if an exam is valid.
  // Starting at 100, we penalize it based on heuristics.
  private readonly PENALTIES: Record<string, number> = {
    'TAB_SWITCH': 15,
    'COPY_PASTE_ATTEMPT': 10,
    'FACE_LOST': 20,
    'MULTIPLE_FACES': 30,
    'AUDIO_SPIKE': 10,
    'PHONE_DETECTED': 35,
    'LOOKING_AWAY': 15,
    'EXTENSION_DETECTED': 25,
    'THREE_WARNINGS_TERMINATION': 100
  };

  async logEvent(attemptId: string, eventType: string, severity: string, details?: any) {
    // 1. Log the individual event
    const log = await this.prisma.proctoringLog.create({
      data: {
        attemptId,
        eventType,
        severity,
        details: JSON.stringify(details || {}),
      }
    });

    // 2. Fetch all logs for this attempt to recalculate Trust Score dynamically
    const allLogs = await this.prisma.proctoringLog.findMany({
      where: { attemptId }
    });

    let currentTrustScore = 100;
    for (const historicLog of allLogs) {
      const penalty = this.PENALTIES[historicLog.eventType] || 0;
      currentTrustScore -= penalty;
    }

    // Floor the score at 0
    currentTrustScore = Math.max(0, currentTrustScore);

    // 3. Trigger Auto-Actions based on heuristics
    let action = 'LOGGED';
    let feedback = `Your proctoring Trust Score is now ${currentTrustScore}%.`;

    if (currentTrustScore <= 0 || eventType === 'THREE_WARNINGS_TERMINATION') {
      currentTrustScore = 0;
      await this.prisma.examAttempt.update({
        where: { id: attemptId },
        data: { 
          status: 'TERMINATED',
          totalScore: 0,
          completedAt: new Date()
        }
      });
      action = 'EXAM_TERMINATED';
      feedback = 'Exam terminated due to multiple severe proctoring infractions.';
    } else if (currentTrustScore < 40) {
      // Flag for Manual Review
      action = 'FLAGGED_FOR_REVIEW';
      feedback = 'WARNING: Critical proctoring infractions detected. Your exam will be manually reviewed by recruiters.';
    } else if (currentTrustScore < 70) {
      action = 'WARNING_ISSUED';
      feedback = 'WARNING: Suspicious activity detected. Please keep your face in frame and remain on the exam tab.';
    }

    return { log, currentTrustScore, action, feedback };
  }

  async getAuditLedger(attemptId: string) {
    const logs = await this.prisma.proctoringLog.findMany({
      where: { attemptId },
      orderBy: { timestamp: 'desc' }
    });

    let currentTrustScore = 100;
    const enrichedLogs = logs.map(log => {
      currentTrustScore -= (this.PENALTIES[log.eventType] || 0);
      return {
        ...log,
        scoreImpact: `-${this.PENALTIES[log.eventType] || 0}%`
      };
    });

    return {
      attemptId,
      finalTrustScore: Math.max(0, currentTrustScore),
      eventLedger: enrichedLogs
    };
  }
}
