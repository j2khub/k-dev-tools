"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, RotateCw, Download } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";

async function getPdfjs() {
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  return lib;
}

type RotationAngle = 0 | 90 | 180 | 270;

export default function PdfRotate() {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [rotations, setRotations] = useState<RotationAngle[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") handleFile(file);
  }, []);

  const handleFile = async (file: File) => {
    setLoading(true);

    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    try {
      const pdf = await PDFDocument.load(buffer);
      const pageCount = pdf.getPageCount();

      setPdfBytes(buffer);
      setFileName(file.name);
      setTotalPages(pageCount);
      setRotations(new Array(pageCount).fill(0));
      setThumbnails([]);

      // Generate thumbnails using pdfjs-dist
      const pdfjsLib = await getPdfjs();
      const pdfDoc = await pdfjsLib.getDocument({ data: buffer.slice(0) })
        .promise;
      const thumbs: string[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        thumbs.push(canvas.toDataURL());
      }

      setThumbnails(thumbs);
    } catch {
      // invalid PDF
    } finally {
      setLoading(false);
    }
  };

  const rotatePage = (index: number) => {
    setRotations((prev) => {
      const next = [...prev];
      next[index] = ((next[index] + 90) % 360) as RotationAngle;
      return next;
    });
  };

  const rotateAll = (angle: RotationAngle) => {
    setRotations((prev) => prev.map(() => angle));
  };

  const handleApply = async () => {
    if (!pdfBytes) return;
    setProcessing(true);

    try {
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = pdf.getPages();

      pages.forEach((page, i) => {
        if (rotations[i] !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotations[i]));
        }
      });

      const savedBytes = await pdf.save();
      const blob = new Blob([savedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "rotated.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      // rotation failed
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setPdfBytes(null);
    setFileName("");
    setTotalPages(0);
    setRotations([]);
    setThumbnails([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const hasAnyRotation = rotations.some((r) => r !== 0);

  return (
    <ToolLayout
      title="PDF 페이지 회전"
      description="PDF 페이지를 원하는 각도로 회전합니다"
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

            {/* Rotate all buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">전체 회전:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rotateAll(90)}
              >
                90&deg;
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rotateAll(180)}
              >
                180&deg;
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rotateAll(270)}
              >
                270&deg;
              </Button>
            </div>

            {/* Thumbnail grid */}
            {loading ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                썸네일 생성 중...
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {thumbnails.map((thumb, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-2 border rounded-lg bg-muted/30"
                  >
                    <div className="relative w-full aspect-[3/4] flex items-center justify-center overflow-hidden">
                      <img
                        src={thumb}
                        alt={`페이지 ${i + 1}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{
                          transform: `rotate(${rotations[i]}deg)`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {i + 1}페이지
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rotations[i] !== 0 && (
                        <span className="text-xs font-mono text-primary">
                          {rotations[i]}&deg;
                        </span>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => rotatePage(i)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Apply and download */}
            <Button
              onClick={handleApply}
              disabled={processing || !hasAnyRotation}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {processing ? "처리 중..." : "적용 및 다운로드"}
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
