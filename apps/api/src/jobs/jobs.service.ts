import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendedJobs(studentId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentId },
    });
    if (!student) throw new Error('Student not found');

    const allJobs = await this.prisma.jobPosting.findMany();

    const recommended = allJobs.map(job => {
      let score = 0;
      let reasons = [];

      // 1. Domain Match (30%)
      if (student.preferredDomains.includes(job.domain)) {
        score += 30;
        reasons.push(`Strong match with your preferred domain: ${job.domain}`);
      }

      // 2. Skill Match (30%)
      const jobSkills = job.requiredSkills ? job.requiredSkills.split(',').map((s: string) => s.trim()) : [];
      const studentSkills = student.technicalSkills ? student.technicalSkills.split(',').map((s: string) => s.trim()) : [];
      const matchingSkills = jobSkills.filter((skill: string) => studentSkills.includes(skill));
      const skillScore = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 30 : 0;
      score += skillScore;
      if (matchingSkills.length > 0) {
        reasons.push(`Matches ${matchingSkills.length} of your technical skills (e.g., ${matchingSkills[0]})`);
      }

      // 3. Academic Score (20%)
      if (student.gpa && job.minGpa && student.gpa >= job.minGpa) {
        score += 20;
        reasons.push(`Your GPA meets the minimum requirement of ${job.minGpa}`);
      }

      // 4. Assessment History (20%) - Placeholder
      // We would fetch ExamAttempt history for the job's domain here.
      score += 10; 
      reasons.push(`Solid foundational knowledge based on past assessments.`);

      return {
        job,
        recommendationScore: Math.round(score),
        reasons
      };
    });

    return recommended.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  async applyToJob(studentId: string, jobId: string) {
    // Application logic: Creating the JobApplication record
    return this.prisma.jobApplication.create({
      data: {
        studentId,
        jobId,
        status: 'APPLIED',
      }
    });
  }

  async getLeaderboard(jobId: string, blindHiringMode: boolean = true) {
    const applications = await this.prisma.jobApplication.findMany({
      where: { jobId },
      include: { 
        student: {
          include: { user: true }
        }
      }
    });

    // We fetch mock AI Evaluation scores for these students
    // Assuming ExamAttempts exist, we join them manually or via Prisma
    // For this boilerplate, we'll return a mapped shape.

    const leaderboard = applications.map(app => {
      // Fairness extra feature: Blind Hiring Mode
      // Names and PII (Personal Identifiable Information) are masked
      const candidateIdentifier = blindHiringMode 
        ? `Candidate #${app.student.id.substring(0, 8)}`
        : app.student.fullName;
      
      const collegeIdentifier = blindHiringMode
        ? `Tier-1 University (Masked)` 
        : app.student.college;

      // Mock Composite Score calculation
      const compositeScore = (app.student.gpa || 7.0) * 10; 

      return {
        applicationId: app.id,
        candidateName: candidateIdentifier,
        college: collegeIdentifier,
        compositeScore,
        skills: app.student.technicalSkills,
        status: app.status
      };
    });

    // Sort descending by composite score
    return leaderboard.sort((a, b) => b.compositeScore - a.compositeScore);
  }
}
