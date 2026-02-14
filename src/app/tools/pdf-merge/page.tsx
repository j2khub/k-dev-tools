"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, X, ChevronUp, ChevronDown, Plus } from "lucide-react";

interface PdfFileEntry {
  file: File;
  pageCount: number;
}

export default function PdfMerge() {
  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [merging, setMerging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPdfFiles = useCallback(async (fileList: FileList | File[]) => {
    const pdfFiles = Array.from(fileList).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    const entries: PdfFileEntry[] = [];
    for (const file of pdfFiles) {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        entries.push({ file, pageCount: pdf.getPageCount() });
      } catch {
        // skip invalid PDF files
      }
    }

    if (entries.length > 0) {
      setFiles((prev) => [...prev, ...entries]);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) {
        loadPdfFiles(e.dataTransfer.files);
      }
    },
    [loadPdfFiles]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadPdfFiles(e.target.files);
    }
    // reset so the same file(s) can be selected again
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);

  const handleMerge = async () => {
    if (files.length < 2) return;
    setMerging(true);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (const entry of files) {
        const buffer = await entry.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      // merge failed silently
    } finally {
      setMerging(false);
    }
  };

  return (
    <ToolLayout
      title="PDF 병합"
      description="여러 PDF 파일을 하나로 합칩니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {files.length === 0 ? (
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
              PDF 파일을 선택하거나 드래그하여 놓으세요 (여러 개 가능)
            </span>
          </button>
        ) : (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`space-y-2 rounded-lg p-2 transition-colors ${dragging ? "bg-primary/5 ring-2 ring-primary ring-dashed" : ""}`}
            >
              {files.map((entry, i) => (
                <div
                  key={`${entry.file.name}-${i}`}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md"
                >
                  <span className="text-xs text-muted-foreground font-mono w-6 text-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm truncate block">
                      {entry.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.pageCount}페이지
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => moveDown(i)}
                      disabled={i === files.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeFile(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                총 {files.length}개 파일, {totalPages}페이지
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  파일 추가
                </Button>
                <Button
                  size="sm"
                  onClick={handleMerge}
                  disabled={files.length < 2 || merging}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  {merging ? "병합 중..." : "병합"}
                </Button>
              </div>
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          모든 처리는 브라우저에서 수행됩니다. 파일이 서버로 전송되지 않습니다.
        </p>
      </Card>
    </ToolLayout>
  );
}
