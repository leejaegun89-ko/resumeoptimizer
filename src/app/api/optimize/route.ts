import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import PizZip from 'pizzip';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const jobDescription = formData.get('jobDescription') as string;
  const companyWebsite = formData.get('companyWebsite') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // 파일을 ArrayBuffer로 읽기
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. docx 파일 파싱
  const zip = new PizZip(buffer);
  const docFile = zip.file('word/document.xml');
  if (!docFile) {
    return NextResponse.json({ error: 'Invalid docx file: document.xml not found' }, { status: 400 });
  }
  const docXml = docFile.asText();

  // 2. bullet point(리스트) 단락 찾기 (ListParagraph 스타일)
  const bulletRegex = /<w:p[^>]*>(?:(?!<w:p>).)*?<w:pStyle[^>]*w:val=\"ListParagraph\"[^>]*>[\s\S]*?<\/w:p>/g;
  const bulletParagraphs = docXml.match(bulletRegex) || [];

  // 3. 각 bullet point의 텍스트 추출
  const textRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
  const bullets = bulletParagraphs.map(p => {
    const matches = [...p.matchAll(textRegex)];
    return matches.map(m => m[1]).join('');
  });

  // 4. AI로 bullet point 수정
  const prompt = `Please optimize the following resume bullet points to better match the job description and company context.\n\nJob Description:\n${jobDescription}\n${companyWebsite ? `Company Website Context:\n${companyWebsite}` : ''}\n\nBullet Points:\n${bullets.join('\n')}\n\nReturn the optimized bullet points in the same order, one per line. Do NOT add or repeat the company name in the bullet points. Each bullet point should focus on the achievement or responsibility only, without mentioning the company name.`;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume writer and career coach. Your task is to optimize resume bullet points to better match job descriptions while maintaining truthfulness and professionalism.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
  });

  const optimizedBullets = completion.choices[0].message.content?.split('\n').filter(Boolean) || [];

  // AI가 수정한 bullet point 리스트만 반환
  return NextResponse.json({ optimizedBullets });
} 