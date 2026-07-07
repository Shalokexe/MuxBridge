import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async generateExamQuestions(jobId: string, studentId: string) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');

    // Rule-based question recommendation logic
    // We aim for 60% Domain, 20% Aptitude, 20% Core CS
    
    const domainQuestions = await this.prisma.question.findMany({
      where: { domain: job.domain, difficulty: 'MEDIUM' },
      take: 6,
    });

    const aptitudeQuestions = await this.prisma.question.findMany({
      where: { domain: 'Aptitude' },
      take: 2,
    });

    const coreCsQuestions = await this.prisma.question.findMany({
      where: { domain: 'Core CS' },
      take: 2,
    });

    return [...domainQuestions, ...aptitudeQuestions, ...coreCsQuestions];
  }

  async startExam(jobId: string, studentId: string) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');
    
    // Check if an exam already exists for this job, else create a generic one
    let exam = await this.prisma.exam.findFirst({ where: { jobId } });
    if (!exam) {
      exam = await this.prisma.exam.create({
        data: {
          jobId,
          title: `${job.title} Assessment`,
          durationMin: 60,
        }
      });
    }

    return this.prisma.examAttempt.create({
      data: {
        studentId,
        examId: exam.id,
        status: 'IN_PROGRESS'
      }
    });
  }

  async startDemoExam() {
    let student = await this.prisma.studentProfile.findFirst();
    if (!student) {
      student = await this.prisma.studentProfile.create({
        data: {
          fullName: 'Demo Candidate',
          technicalSkills: 'React,Node.js,Python',
          preferredDomains: 'AI/ML',
          user: {
            create: {
              email: `demo-student-${Date.now()}@example.com`,
              passwordHash: 'hashed',
              role: 'STUDENT'
            }
          }
        }
      });
    }

    let job = await this.prisma.jobPosting.findFirst();
    if (!job) {
      let company = await this.prisma.companyProfile.findFirst();
      if (!company) {
        company = await this.prisma.companyProfile.create({
          data: {
            companyName: 'Demo Corp',
            user: {
              create: {
                email: `demo-company-${Date.now()}@example.com`,
                passwordHash: 'hashed',
                role: 'COMPANY'
              }
            }
          }
        });
      }

      job = await this.prisma.jobPosting.create({
        data: {
          companyId: company.id,
          title: 'AI/ML Engineer',
          description: 'A demo role for AI/ML assessment.',
          domain: 'AI/ML',
          requiredSkills: 'Python,TensorFlow,React'
        }
      });
    }

    return this.startExam(job.id, student.userId);
  }
}
