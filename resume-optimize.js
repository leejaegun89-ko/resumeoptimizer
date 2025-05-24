require('dotenv').config();
const fs = require('fs');
const words = require('asposewordscloud');

// 1. Aspose API 인증
const config = new words.Configuration(
  process.env.ASPOSE_APP_SID,
  process.env.ASPOSE_APP_KEY
);
const wordsApi = new words.WordsApi(config);

async function optimizeResume() {
  // 2. 워드 파일 업로드
  const localFile = 'resume.docx'; // 실제 파일명
  const remoteFile = 'resume.docx';
  await wordsApi.uploadFile(new words.UploadFileRequest(
    fs.createReadStream(localFile), remoteFile
  ));

  // 3. bullet point 추출
  const paragraphsResult = await wordsApi.getParagraphs(new words.GetParagraphsRequest(remoteFile));
  const paragraphs = paragraphsResult.body.paragraphs.paragraphLinkList;
  const bullets = paragraphs
    .filter(p => p.text && (p.text.trim().startsWith('•') || p.text.trim().match(/^\\d+\\./)))
    .map(p => p.text);

  // 4. (임시) bullet point 최적화: 실제로는 OpenAI로 대체
  const optimizedBullets = bullets.map(b => b + ' (optimized)');

  // 5. bullet point 치환
  for (let i = 0; i < bullets.length; i++) {
    const paraIndex = paragraphs.findIndex(p => p.text === bullets[i]);
    if (paraIndex !== -1) {
      await wordsApi.updateParagraph(new words.UpdateParagraphRequest(
        remoteFile,
        { text: optimizedBullets[i] },
        paragraphs[paraIndex].nodeId
      ));
    }
  }

  // 6. 최종 워드 파일 다운로드
  const downloadResult = await wordsApi.downloadFile(new words.DownloadFileRequest(remoteFile));
  fs.writeFileSync('optimized-resume.docx', downloadResult.body);

  console.log('완료! optimized-resume.docx 파일을 확인하세요.');
}

optimizeResume();