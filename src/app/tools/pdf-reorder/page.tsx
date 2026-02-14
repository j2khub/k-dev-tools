"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, X, ChevronUp, ChevronDown } from "lucide-react";

async function getPdfjs() {
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  return lib;
}

export default function PdfReorder() {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const renderThumbnails = useCallback(async (buffer: ArrayBuffer) => {
    const pdfjsLib = await getPdfjs();
    const uint8 = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
    const count = pdf.numPages;
    const dataUrls: string[] = [];

    for (let i = 1; i <= count; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      dataUrls.push(canvas.toDataURL("image/png"));
    }

    return dataUrls;
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);

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
        setPageOrder(Array.from({ length: pages }, (_, i) => i));

        const thumbs = await renderThumbnails(buffer);
        setThumbnails(thumbs);
      } catch {
        setError("PDF 파일을 읽을 수 없습니다. 유효한 PDF인지 확인해주세요.");
      } finally {
        setLoading(false);
      }
    },
    [renderThumbnails]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf"))
      ) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPageOrder((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setPageOrder((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const removePage = (index: number) => {
    setPageOrder((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleApply = async () => {
    if (!pdfBytes || pageOrder.length === 0) return;
    setApplying(true);
    setError(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, pageOrder);

      copiedPages.forEach((page) => {
        newDoc.addPage(page);
      });

      const newPdfBytes = await newDoc.save();
      const blob = new Blob([newPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "reordered.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      setError("PDF 재정렬 중 오류가 발생했습니다.");
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    setPdfBytes(null);
    setFileName("");
    setTotalPages(0);
    setPageOrder([]);
    setThumbnails([]);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <ToolLayout
      title="PDF 페이지 재정렬"
      description="PDF 페이지 순서를 변경하거나 특정 페이지를 삭제합니다"
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
          <>
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

            {loading && (
              <div className="text-sm text-muted-foreground text-center">
                PDF 로딩 중...
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{fileName}</span>
                <span className="text-muted-foreground ml-2">
                  ({totalPages}페이지)
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={handleReset}>
                다른 파일
              </Button>
            </div>

            <div className="text-sm font-medium bg-muted px-3 py-2 rounded-md">
              페이지 순서:{" "}
              <span className="font-mono">
                {pageOrder.map((p) => p + 1).join(", ")}
              </span>
              {pageOrder.length < totalPages && (
                <span className="text-destructive ml-2">
                  ({totalPages - pageOrder.length}페이지 삭제됨)
                </span>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pageOrder.map((pageIdx, orderIdx) => (
                <div
                  key={`${pageIdx}-${orderIdx}`}
                  className="border rounded-lg p-2 flex flex-col items-center gap-2 bg-background"
                >
                  <div className="text-xs font-medium text-muted-foreground">
                    원본 {pageIdx + 1}페이지
                  </div>

                  {thumbnails[pageIdx] && (
                    <img
                      src={thumbnails[pageIdx]}
                      alt={`페이지 ${pageIdx + 1}`}
                      className="w-full rounded border bg-white"
                      draggable={false}
                    />
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => moveUp(orderIdx)}
                      disabled={orderIdx === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => moveDown(orderIdx)}
                      disabled={orderIdx === pageOrder.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removePage(orderIdx)}
                      disabled={pageOrder.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleApply}
              disabled={applying || pageOrder.length === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {applying ? "처리 중..." : "적용 및 다운로드"}
            </Button>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          모든 처리는 브라우저에서 수행됩니다. 파일이 서버로 전송되지 않습니다.
        </p>
      </Card>
    </ToolLayout>
  );
}
