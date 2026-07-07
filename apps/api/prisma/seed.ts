import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const domains = ['AI/ML', 'Data Analytics', 'Web Development', 'Cybersecurity', 'Cloud/DevOps'];
const skillsPool = ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'NoSQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'TensorFlow', 'Cybersecurity Basics', 'Linux'];

function getRandomItemsString(arr: string[], count: number) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(',');
}

async function main() {
  console.log('Clearing database...');
  await prisma.answer.deleteMany();
  await prisma.proctoringLog.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Companies...');
  const companies = [];
  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: {
        email: `company${i}@example.com`,
        passwordHash: 'hashed_password',
        role: 'COMPANY',
        companyProfile: {
          create: {
            companyName: `TechCompany ${i}`,
            website: `https://techcompany${i}.com`,
            description: 'A synthetic tech company for MuxBridge testing.',
          },
        },
      },
      include: { companyProfile: true },
    });
    companies.push(user.companyProfile);
  }

  console.log('Seeding Jobs...');
  const jobs = [];
  for (const company of companies) {
    if (!company) continue;
    for (let j = 0; j < 2; j++) {
      const jobDomain = domains[Math.floor(Math.random() * domains.length)];
      const job = await prisma.jobPosting.create({
        data: {
          companyId: company.id,
          title: `${jobDomain} Engineer`,
          description: `Looking for a great ${jobDomain} engineer to join our team.`,
          domain: jobDomain,
          requiredSkills: getRandomItemsString(skillsPool, 3),
          minGpa: 7.0 + Math.random() * 2,
        },
      });
      jobs.push(job);
    }
  }

  console.log('Seeding Students...');
  for (let i = 1; i <= 100; i++) {
    await prisma.user.create({
      data: {
        email: `student${i}@example.com`,
        passwordHash: 'hashed_password',
        role: 'STUDENT',
        studentProfile: {
          create: {
            fullName: `Student Name ${i}`,
            college: 'Synthetic University',
            graduationYear: 2024 + Math.floor(Math.random() * 3),
            gpa: 6.0 + Math.random() * 4.0,
            technicalSkills: getRandomItemsString(skillsPool, 4),
            preferredDomains: getRandomItemsString(domains, 2),
          },
        },
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
