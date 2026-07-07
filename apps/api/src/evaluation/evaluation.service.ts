import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EvaluationService {
  constructor(private prisma: PrismaService) {}

  async evaluateSubjectiveAnswer(attemptId: string, answerText: string, expectedKeywords: string[]) {
    // MOCK AI EVALUATION PIPELINE
    // In a real scenario, this would call an LLM (e.g., OpenAI) with the prompt and student answer.
    
    let score = 0;
    let feedback = [];
    
    const wordCount = answerText.split(' ').length;
    
    if (wordCount < 10) {
      score += 10;
      feedback.push('Answer is too short and lacks detail.');
    } else if (wordCount > 50) {
      score += 40;
      feedback.push('Good length and detail.');
    } else {
      score += 25;
      feedback.push('Adequate length but could be expanded.');
    }

    const matchedKeywords = expectedKeywords.filter(kw => answerText.toLowerCase().includes(kw.toLowerCase()));
    const keywordScore = (matchedKeywords.length / expectedKeywords.length) * 60;
    score += keywordScore;
    
    if (matchedKeywords.length === expectedKeywords.length) {
      feedback.push('Excellent use of required terminology.');
    } else if (matchedKeywords.length > 0) {
      feedback.push(`Used some terminology, missed: ${expectedKeywords.filter(kw => !matchedKeywords.includes(kw)).join(', ')}`);
    } else {
      feedback.push('Did not use expected terminology.');
    }

    const requiresHuman = score < 50; // Flag for review if score is low
    
    return {
      attemptId,
      aiScore: Math.round(score),
      confidence: 0.85, // Mock confidence
      feedback: feedback.join(' '),
      requiresHuman,
    };
  }
}
