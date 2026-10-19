/**
 * Local development catalogue only.
 * Refuses to run unless LEARNING_DEMO_SEED=1 and NODE_ENV is not production.
 * Not part of migrations.
 */
import { PrismaClient } from '@prisma/client';

if (process.env.LEARNING_DEMO_SEED !== '1' || process.env.NODE_ENV === 'production') {
  console.error('Refusing demo seed. Set LEARNING_DEMO_SEED=1 outside production.');
  process.exit(1);
}

const prisma = new PrismaClient();
const tenantId = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const authorUserId = '0b0b0b0b-0b0b-4b0b-8b0b-0b0b0b0b0b0b';

type DemoCourse = {
  id: string;
  code: string;
  title: string;
  description: string;
  areaCode: string;
  image: string;
  price: string;
  chapterId: string;
  lessonId: string;
  textBlockId: string;
  videoBlockId: string;
  pdfBlockId: string;
  quizId: string;
  itemId: string;
  choiceA: string;
  choiceB: string;
};

const courses: readonly DemoCourse[] = [
  {
    id: 'c1000000-0000-4000-8000-000000000001',
    code: 'DIGCOMP-01',
    title: 'Osnove digitalne kompetencije',
    description: 'Uvod u pretragu, sigurnost naloga i svakodnevni rad s dokumentima.',
    areaCode: 'DIGCOMP',
    image: '/learning/cover-digcomp.svg',
    price: '0.00',
    chapterId: 'd1000000-0000-4000-8000-000000000001',
    lessonId: 'e1000000-0000-4000-8000-000000000001',
    textBlockId: 'f1000000-0000-4000-8000-000000000001',
    videoBlockId: 'f1000000-0000-4000-8000-000000000002',
    pdfBlockId: 'f1000000-0000-4000-8000-000000000003',
    quizId: 'a1000000-0000-4000-8000-000000000001',
    itemId: 'b1000000-0000-4000-8000-000000000001',
    choiceA: '91000000-0000-4000-8000-000000000001',
    choiceB: '91000000-0000-4000-8000-000000000002',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000002',
    code: 'DIGCOMP-02',
    title: 'Saradnja i digitalni sadržaj',
    description: 'Dijeljenje sadržaja, licence i zajednički rad na dokumentu.',
    areaCode: 'DIGCOMP',
    image: '/learning/cover-digcomp.svg',
    price: '120.00',
    chapterId: 'd1000000-0000-4000-8000-000000000002',
    lessonId: 'e1000000-0000-4000-8000-000000000002',
    textBlockId: 'f1000000-0000-4000-8000-000000000011',
    videoBlockId: 'f1000000-0000-4000-8000-000000000012',
    pdfBlockId: 'f1000000-0000-4000-8000-000000000013',
    quizId: 'a1000000-0000-4000-8000-000000000002',
    itemId: 'b1000000-0000-4000-8000-000000000002',
    choiceA: '91000000-0000-4000-8000-000000000011',
    choiceB: '91000000-0000-4000-8000-000000000012',
  },
  {
    id: 'c2000000-0000-4000-8000-000000000001',
    code: 'ISMS-01',
    title: 'Uvod u informacionu sigurnost',
    description: 'Povjerljivost, integritet i dostupnost u svakodnevnom radu.',
    areaCode: 'ISMS',
    image: '/learning/cover-isms.svg',
    price: '90.00',
    chapterId: 'd2000000-0000-4000-8000-000000000001',
    lessonId: 'e2000000-0000-4000-8000-000000000001',
    textBlockId: 'f2000000-0000-4000-8000-000000000001',
    videoBlockId: 'f2000000-0000-4000-8000-000000000002',
    pdfBlockId: 'f2000000-0000-4000-8000-000000000003',
    quizId: 'a2000000-0000-4000-8000-000000000001',
    itemId: 'b2000000-0000-4000-8000-000000000001',
    choiceA: '92000000-0000-4000-8000-000000000001',
    choiceB: '92000000-0000-4000-8000-000000000002',
  },
  {
    id: 'c2000000-0000-4000-8000-000000000002',
    code: 'ISMS-02',
    title: 'Lozinke i više faktora',
    description: 'Kako prepoznati phishing i zašto drugi faktor smanjuje rizik.',
    areaCode: 'ISMS',
    image: '/learning/cover-isms.svg',
    price: '0.00',
    chapterId: 'd2000000-0000-4000-8000-000000000002',
    lessonId: 'e2000000-0000-4000-8000-000000000002',
    textBlockId: 'f2000000-0000-4000-8000-000000000011',
    videoBlockId: 'f2000000-0000-4000-8000-000000000012',
    pdfBlockId: 'f2000000-0000-4000-8000-000000000013',
    quizId: 'a2000000-0000-4000-8000-000000000002',
    itemId: 'b2000000-0000-4000-8000-000000000002',
    choiceA: '92000000-0000-4000-8000-000000000011',
    choiceB: '92000000-0000-4000-8000-000000000012',
  },
  {
    id: 'c3000000-0000-4000-8000-000000000001',
    code: 'QMS-01',
    title: 'Osnove upravljanja kvalitetom',
    description: 'Proces, zapis i korektivna radnja bez tvrdnje o certifikatu sistema.',
    areaCode: 'QMS',
    image: '/learning/cover-qms.svg',
    price: '75.00',
    chapterId: 'd3000000-0000-4000-8000-000000000001',
    lessonId: 'e3000000-0000-4000-8000-000000000001',
    textBlockId: 'f3000000-0000-4000-8000-000000000001',
    videoBlockId: 'f3000000-0000-4000-8000-000000000002',
    pdfBlockId: 'f3000000-0000-4000-8000-000000000003',
    quizId: 'a3000000-0000-4000-8000-000000000001',
    itemId: 'b3000000-0000-4000-8000-000000000001',
    choiceA: '93000000-0000-4000-8000-000000000001',
    choiceB: '93000000-0000-4000-8000-000000000002',
  },
  {
    id: 'c3000000-0000-4000-8000-000000000002',
    code: 'QMS-02',
    title: 'Zapis i sljedivost',
    description: 'Šta se bilježi tokom obuke i zašto zapis nije certifikat osobe.',
    areaCode: 'QMS',
    image: '/learning/cover-qms.svg',
    price: '0.00',
    chapterId: 'd3000000-0000-4000-8000-000000000002',
    lessonId: 'e3000000-0000-4000-8000-000000000002',
    textBlockId: 'f3000000-0000-4000-8000-000000000011',
    videoBlockId: 'f3000000-0000-4000-8000-000000000012',
    pdfBlockId: 'f3000000-0000-4000-8000-000000000013',
    quizId: 'a3000000-0000-4000-8000-000000000002',
    itemId: 'b3000000-0000-4000-8000-000000000002',
    choiceA: '93000000-0000-4000-8000-000000000011',
    choiceB: '93000000-0000-4000-8000-000000000012',
  },
];

async function main(): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: tenantId },
    create: { id: tenantId, isActive: true },
    update: { isActive: true },
  });
  await prisma.user.upsert({
    where: { tenantId_id: { tenantId, id: authorUserId } },
    create: {
      id: authorUserId,
      tenantId,
      email: 'learning-demo-author@confora.local',
      isActive: true,
    },
    update: { isActive: true },
  });

  for (const course of courses) {
    await prisma.course.upsert({
      where: { tenantId_code: { tenantId, code: course.code } },
      create: {
        id: course.id,
        tenantId,
        code: course.code,
        title: course.title,
        description: course.description,
        areaCode: course.areaCode,
        imageObjectKey: course.image,
        language: 'bs',
        educationalLevel: 'introductory',
        targetAudience: 'Polaznici obuke',
        typicalLearningTimeMinutes: 30,
        learningObjectives: 'Prepoznati osnovne pojmove oblasti i završiti kviz poglavlja.',
        priceAmount: course.price,
        priceCurrency: 'BAM',
        minimumTimeSeconds: 30,
        lifecycle: 'PUBLISHED',
        authorUserId,
      },
      update: {
        title: course.title,
        description: course.description,
        lifecycle: 'PUBLISHED',
        imageObjectKey: course.image,
        priceAmount: course.price,
      },
    });
    await prisma.courseChapter.upsert({
      where: { id: course.chapterId },
      create: {
        id: course.chapterId,
        tenantId,
        courseId: course.id,
        sequence: 1,
        title: 'Poglavlje 1',
        minimumTimeSeconds: 30,
      },
      update: { title: 'Poglavlje 1' },
    });
    await prisma.courseLesson.upsert({
      where: { id: course.lessonId },
      create: {
        id: course.lessonId,
        tenantId,
        chapterId: course.chapterId,
        sequence: 1,
        title: 'Uvodna lekcija',
        minimumTimeSeconds: 30,
      },
      update: { title: 'Uvodna lekcija' },
    });
    await prisma.contentBlock.upsert({
      where: { id: course.textBlockId },
      create: {
        id: course.textBlockId,
        tenantId,
        lessonId: course.lessonId,
        sequence: 1,
        kind: 'TEXT',
        title: 'Tekst',
        textBody: `${course.title}. Ovo je tekstualni blok za lokalni prikaz. Obuka nije certifikat osobe.`,
      },
      update: { textBody: `${course.title}. Ovo je tekstualni blok za lokalni prikaz.` },
    });
    await prisma.contentBlock.upsert({
      where: { id: course.videoBlockId },
      create: {
        id: course.videoBlockId,
        tenantId,
        lessonId: course.lessonId,
        sequence: 2,
        kind: 'VIDEO',
        title: 'Video',
        objectKey: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      },
      update: { kind: 'VIDEO' },
    });
    await prisma.contentBlock.upsert({
      where: { id: course.pdfBlockId },
      create: {
        id: course.pdfBlockId,
        tenantId,
        lessonId: course.lessonId,
        sequence: 3,
        kind: 'PDF',
        title: 'Bilješka',
        objectKey: '/learning/cover-digcomp.svg',
      },
      update: { kind: 'PDF' },
    });
    await prisma.assessmentItem.upsert({
      where: { id: course.itemId },
      create: {
        id: course.itemId,
        tenantId,
        courseId: course.id,
        stem: 'Šta važi za ovu obuku?',
        correctChoiceKey: 'A',
        timeLimitSeconds: 60,
        reviewState: 'APPROVED',
        isAiGenerated: false,
      },
      update: { reviewState: 'APPROVED' },
    });
    await prisma.assessmentItemChoice.upsert({
      where: { id: course.choiceA },
      create: {
        id: course.choiceA,
        tenantId,
        itemId: course.itemId,
        choiceKey: 'A',
        text: 'Obuka je odvojena od certifikata osobe.',
      },
      update: { text: 'Obuka je odvojena od certifikata osobe.' },
    });
    await prisma.assessmentItemChoice.upsert({
      where: { id: course.choiceB },
      create: {
        id: course.choiceB,
        tenantId,
        itemId: course.itemId,
        choiceKey: 'B',
        text: 'Završetak kviza sam izdaje certifikat osobe.',
      },
      update: { text: 'Završetak kviza sam izdaje certifikat osobe.' },
    });
    await prisma.quiz.upsert({
      where: { id: course.quizId },
      create: {
        id: course.quizId,
        tenantId,
        chapterId: course.chapterId,
        title: 'Kviz poglavlja',
        passMarkPercent: 100,
      },
      update: { title: 'Kviz poglavlja' },
    });
    await prisma.quizItem.upsert({
      where: { id: `${course.quizId}` },
      create: {
        id: course.quizId,
        tenantId,
        quizId: course.quizId,
        itemId: course.itemId,
        sequence: 1,
      },
      update: { sequence: 1 },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
