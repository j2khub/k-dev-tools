"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";

interface SplitResult {
  label: string;
  url: string;
  filename: string;
}

function parsePageRanges(
  input: string,
  totalPages: number
): { ranges: number[][]; error: string | null } {
  const ranges: number[][] = [];
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  if (parts.length === 0) {
    return { ranges: [], error: "페이지 범위를 입력해주세요." };
  }

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = part.match(/^(\d+)$/);

    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);

      if (start < 1 || end < 1) {
        return { ranges: [], error: `잘못된 범위: "${part}" (페이지 번호는 1 이상이어야 합니다)` };
      }
      if (start > totalPages || end > totalPages) {
        return { ranges: [], error: `잘못된 범위: "${part}" (총 ${totalPages}페이지)` };
      }
      if (start > end) {
        return { ranges: [], error: `잘못된 범위: "${part}" (시작이 끝보다 큽니다)` };
      }

      const pages: number[] = [];
      for (let i = start; i <= end; i++) {
        pages.push(i - 1); // convert to 0-based
      }
      ranges.push(pages);
    } else if (singleMatch) {
      const page = parseInt(singleMatch[1], 10);

      if (page < 1) {
        return { ranges: [], error: `잘못된 페이지: "${part}" (페이지 번호는 1 이상이어야 합니다)` };
      }
      if (page > totalPages) {
        return { ranges: [], error: `잘못된 페이지: "${part}" (총 ${totalPages}페이지)` };
      }

      ranges.push([page - 1]); // convert to 0-based
    } else {
      return { ranges: [], error: `잘못된 형식: "${part}"` };
    }
  }

  return { ranges, error: null };
}

function rangeLabel(pages: number[]): string {
  // pages are 0-based, display as 1-based
  if (pages.length === 1) {
    return `${pages[0] + 1}`;
  }
  return `${pages[0] + 1}-${pages[pages.length - 1] + 1}`;
}

export default function PdfSplit() {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [splitting, setSplitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") handleFile(file);
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    setResults([]);
    setRangeInput("");

    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(buffer);
      const pages = pdf.getPageCount();
      setPdfBytes(buffer);
      setFileName(file.name);
      setTotalPages(pages);
    } catch {
      setError("PDF 파일을 읽을 수 없습니다. 유효한 PDF인지 확인해주세요.");
    }
  };

  const handleSplit = async () => {
    if (!pdfBytes) return;

    setError(null);
    setResults([]);

    const { ranges, error: parseError } = parsePageRanges(rangeInput, totalPages);
    if (parseError) {
      setError(parseError);
      return;
    }

    setSplitting(true);

    try {
      // Clean up previous blob URLs
      results.forEach((r) => URL.revokeObjectURL(r.url));

      const { PDFDocument } = await import("pdf-lib");
      const newResults: SplitResult[] = [];

      for (const pages of ranges) {
        const srcDoc = await PDFDocument.load(pdfBytes);
        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, pages);

        copiedPages.forEach((page) => {
          newDoc.addPage(page);
        });

        const newPdfBytes = await newDoc.save();
        const blob = new Blob([newPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const label = rangeLabel(pages);

        newResults.push({
          label,
          url,
          filename: `split_${label}.pdf`,
        });
      }

      setResults(newResults);
    } catch {
      setError("PDF 분할 중 오류가 발생했습니다.");
    } finally {
      setSplitting(false);
    }
  };

  const handleReset = () => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setPdfBytes(null);
    setFileName("");
    setTotalPages(0);
    setRangeInput("");
    setError(null);
    setResults([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <ToolLayout
      title="PDF 분할"
      description="PDF 파일을 원하는 페이지 범위로 분할합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!pdfBytes ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">PDF 파일을 선택하거나 드래그하여 놓으세요</span>
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{fileName}</span>
                <span className="text-muted-foreground ml-2">({totalPages}페이지)</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleReset}>
                다른 파일
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">페이지 범위</label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => {
                  setRangeInput(e.target.value);
                  setError(null);
                }}
                placeholder="예: 1-3, 5, 7-10 (쉼표로 구분하여 여러 범위 입력)"
                className="w-full px-3 py-2 text-sm border rounded-md bg-transparent font-mono"
              />
              <p className="text-xs text-muted-foreground">
                각 범위가 별도의 PDF 파일로 분할됩니다. 예: &quot;1-3, 5, 7-10&quot; → 3개의 PDF
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={handleSplit}
              disabled={splitting || !rangeInput.trim()}
            >
              {splitting ? "분할 중..." : "분할"}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">분할 결과 ({results.length}개 파일)</div>
                {results.map((result, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
                  >
                    <span className="text-sm font-mono">{result.filename}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(result.url, result.filename)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      다운로드
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <p className="text-xs text-muted-foreground">
          모든 처리는 브라우저에서 수행됩니다. 파일이 서버로 전송되지 않습니다.
        </p>
      </Card>
    </ToolLayout>
  );
}
