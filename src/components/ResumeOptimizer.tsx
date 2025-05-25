'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import mammoth from 'mammoth';
import htmlDocx from 'html-docx-js/dist/html-docx';

interface OptimizedContent {
  original: string;
  optimized: string;
}

export default function ResumeOptimizer() {
  const [jobDescription, setJobDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [resumeContent, setResumeContent] = useState<string>('');
  const [resumeHtml, setResumeHtml] = useState<string>('');
  const [optimizedHtml, setOptimizedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [optimizedBullets, setOptimizedBullets] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setResumeContent(result.value); // plain text
      setResumeHtml(result.value); // 원본 HTML 저장
      setOptimizedHtml(''); // 새 업로드 시 이전 결과 초기화
      setUploadedFile(file); // 파일 상태 저장
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleOptimize = async () => {
    if (!jobDescription || !resumeContent || !resumeHtml || !uploadedFile) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('jobDescription', jobDescription);
      formData.append('companyWebsite', companyWebsite);

      const response = await fetch('/api/optimize', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to optimize resume');
      const data = await response.json();
      setOptimizedBullets(data.optimizedBullets);

      // 원본 HTML에서 bullet point만 하이라이트해서 교체
      const parser = new DOMParser();
      const doc = parser.parseFromString(resumeHtml, 'text/html');
      const bulletLis = Array.from(doc.querySelectorAll('ul li, ol li'));
      data.optimizedBullets.forEach((bullet: string, idx: number) => {
        if (bulletLis[idx]) {
          bulletLis[idx].innerHTML = `<mark style='background: #fff9c0'>${bullet}</mark>`;
        }
      });
      setOptimizedHtml(doc.body.innerHTML);
    } catch (error) {
      console.error('Error optimizing resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!optimizedHtml) return;
    const html = `<html><head><meta charset="utf-8"></head><body>${optimizedHtml}</body></html>`;
    const docxBlob = htmlDocx.asBlob(html);
    const url = window.URL.createObjectURL(docxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-resume.docx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const isOptimizeEnabled = jobDescription && resumeContent;

  const cleanBullet = (text: string) => {
    // 불렛/숫자 prefix 제거, 끝 마침표 제거, 앞뒤 공백 제거
    return text.replace(/^[-•\d.\s]+/, '').replace(/[.\s]+$/, '');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="block">
          <span className="block text-xl font-bold text-[#ffe066] mb-2 drop-shadow">Job Description</span>
          <textarea
            className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 text-white shadow-lg focus:border-yellow-400 focus:ring-yellow-400 placeholder:text-zinc-400 transition"
            rows={6}
            placeholder="Paste the Job Description here"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="block text-xl font-bold text-[#ffe066] mb-2 drop-shadow">Company Website (Optional)</span>
          <input
            type="url"
            className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 text-white shadow-lg focus:border-yellow-400 focus:ring-yellow-400 placeholder:text-zinc-400 transition"
            placeholder="https://company.com"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
          />
        </label>

        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition ${
            isDragActive ? 'border-yellow-400 bg-zinc-800' : 'border-zinc-700 bg-zinc-900'
          }`}
        >
          <div className="space-y-1 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-yellow-300" />
            <div className="flex text-sm text-zinc-300">
              <input {...getInputProps()} />
              <p className="pl-1">Drag and drop your resume, or click to select</p>
            </div>
            <p className="text-xs text-zinc-500">DOCX files only</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleOptimize}
          disabled={!isOptimizeEnabled || isLoading}
          className={`px-6 py-2 rounded-lg text-black font-bold shadow-lg transition text-lg tracking-wide ${
            isOptimizeEnabled
              ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:to-yellow-300'
              : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Optimizing...' : 'Optimize Resume'}
        </button>

        {optimizedHtml && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Download</span>
          </button>
        )}
      </div>

      {/* Preview: Optimize 후에만 보여줌 */}
      {optimizedHtml && (
        <div className="mt-8 p-6 bg-zinc-900 rounded-2xl border border-zinc-700 shadow-xl">
          <h3 className="text-xl font-bold text-[#ffe066] mb-4 drop-shadow">Preview</h3>
          <p className="text-sm text-zinc-400 mb-2">Highlighted lines are the bullet points that have been optimized.</p>
          <div className="prose max-w-none bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-white">
            {/* bullet point만 하이라이트해서 렌더링 */}
            {(() => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(resumeHtml, 'text/html');
              const bulletLis = Array.from(doc.querySelectorAll('ul li, ol li'));
              optimizedBullets.forEach((bullet: string, idx: number) => {
                if (bulletLis[idx]) {
                  bulletLis[idx].innerHTML = `<mark style='background: #ffe066; color: #222; border-radius: 0.3em; padding: 0 0.2em;'>${cleanBullet(bullet)}</mark>`;
                }
              });
              return <div dangerouslySetInnerHTML={{ __html: doc.body.innerHTML }} />;
            })()}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-300 transition flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 