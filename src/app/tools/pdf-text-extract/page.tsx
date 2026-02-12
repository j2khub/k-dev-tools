"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Upload } from "lucide-react";

async function getPdfjs() {
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  return lib;
}

export default function PdfTextExtract() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [noText, setNoText] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { copy, copied } = useCopyToClipboard();

  const extractText = async (file: File) => {
    setFileName(file.name);
    setExtracting(true);
    setNoText(false);
    setText("");

    const pdfjsLib = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = doc.numPages;
    setProgress({ current: 0, total: numPages });

    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (item as any).str)
        .join(" ");

      if (i > 1) {
        fullText += `\n\n--- 페이지 ${i} ---\n\n`;
      } else {
        fullText += `--- 페이지 ${i} ---\n\n`;
      }
      fullText += pageText;

      setProgress({ current: i, total: numPages });
    }

    const trimmed = fullText.trim();
    const charCount = trimmed.replace(/--- 페이지 \d+ ---/g, "").replace(/\n/g, "").replace(/ /g, "").length;

    setTotalPages(numPages);
    setTotalChars(charCount);
    setText(trimmed);
    setExtracting(false);

    if (charCount === 0) {
      setNoText(true);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      extractText(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) extractText(file);
  };

  const reset = () => {
    setText("");
    setFileName("");
    setTotalPages(0);
    setTotalChars(0);
    setExtracting(false);
    setNoText(false);
    setProgress({ current: 0, total: 0 });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <ToolLayout
      title="PDF 텍스트 추출"
      description="PDF 파일에서 텍스트를 추출합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {!fileName && !extracting ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">
              PDF 파일을 선택하거나 드래그하여 놓으세요
            </span>
          </button>
        ) : (
          <>
            {extracting && (
              <div className="text-sm text-muted-foreground">
                텍스트 추출 중... {progress.current}/{progress.total} 페이지
              </div>
            )}

            {!extracting && text && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {fileName} — {totalPages}페이지, {totalChars.toLocaleString()}자 추출
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(text)}
                    >
                      {copied ? "복사됨!" : "복사"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={reset}
                    >
                      다른 파일
                    </Button>
                  </div>
                </div>

                <Textarea
                  readOnly
                  value={text}
                  className="min-h-[400px] font-mono text-sm"
                />
              </>
            )}

            {!extracting && noText && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  텍스트를 추출할 수 없습니다. 스캔된 이미지 PDF일 수 있습니다.
                </p>
                <Button variant="outline" size="sm" onClick={reset}>
                  다른 파일
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
