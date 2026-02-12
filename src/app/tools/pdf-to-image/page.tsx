"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";

async function getPdfjs() {
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  return lib;
}

type ImageFormat = "png" | "jpeg";
type ScaleOption = 1 | 2 | 3;

interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
}

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [scale, setScale] = useState<ScaleOption>(2);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setImages([]);
    setError(null);
    setConverting(false);
    setProgress({ current: 0, total: 0 });
    if (fileRef.current) fileRef.current.value = "";
  };

  const loadPdf = async (pdfFile: File) => {
    try {
      setError(null);
      setImages([]);
      const pdfjsLib = await getPdfjs();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setFile(pdfFile);
      setPageCount(doc.numPages);
    } catch {
      setError("PDF 파일을 읽을 수 없습니다. 유효한 PDF 파일인지 확인해 주세요.");
    }
  };

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("PDF 파일만 업로드할 수 있습니다.");
      return;
    }
    loadPdf(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const convert = async () => {
    if (!file) return;
    setConverting(true);
    setImages([]);
    setError(null);

    try {
      const pdfjsLib = await getPdfjs();
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const total = doc.numPages;
      setProgress({ current: 0, total });
      const results: ConvertedImage[] = [];

      for (let i = 1; i <= total; i++) {
        setProgress({ current: i, total });
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const dataUrl =
          format === "png"
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", 0.9);

        results.push({ pageNumber: i, dataUrl });
      }

      setImages(results);
    } catch {
      setError("변환 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setConverting(false);
    }
  };

  const downloadImage = (img: ConvertedImage) => {
    const ext = format === "png" ? "png" : "jpg";
    const baseName = file?.name.replace(/\.pdf$/i, "") ?? "page";
    const link = document.createElement("a");
    link.download = `${baseName}_${img.pageNumber}.${ext}`;
    link.href = img.dataUrl;
    link.click();
  };

  const downloadAll = async () => {
    for (const img of images) {
      downloadImage(img);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  const fileExtLabel = format === "png" ? "PNG" : "JPEG";

  return (
    <ToolLayout
      title="PDF → 이미지"
      description="PDF 파일의 각 페이지를 이미지로 변환합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!file ? (
          <>
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
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </>
        ) : images.length === 0 ? (
          <>
            <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
              <div className="text-sm">
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground ml-2">({pageCount}페이지)</span>
              </div>
              <Button size="sm" variant="ghost" onClick={reset}>
                다른 파일
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium shrink-0">포맷</label>
                <div className="flex gap-1">
                  {(["png", "jpeg"] as ImageFormat[]).map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant={format === f ? "default" : "outline"}
                      onClick={() => setFormat(f)}
                    >
                      {f === "png" ? "PNG" : "JPEG"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium shrink-0">배율</label>
                <div className="flex gap-1">
                  {([1, 2, 3] as ScaleOption[]).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={scale === s ? "default" : "outline"}
                      onClick={() => setScale(s)}
                    >
                      {s}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={convert} disabled={converting} className="w-full">
              {converting
                ? `변환 중... ${progress.current}/${progress.total} 페이지`
                : "변환"}
            </Button>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground ml-2">
                  ({images.length}페이지 · {fileExtLabel} · {scale}x)
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={reset}>
                  다른 파일
                </Button>
                <Button size="sm" onClick={downloadAll}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  전체 다운로드
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.pageNumber}
                  className="group relative border rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={img.dataUrl}
                    alt={`${img.pageNumber}페이지`}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadImage(img)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {img.pageNumber}p
                    </Button>
                  </div>
                  <div className="text-center text-xs text-muted-foreground py-1">
                    {img.pageNumber} / {images.length}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          모든 변환은 브라우저에서 처리됩니다. PDF 파일이 서버로 전송되지 않습니다.
        </p>
      </Card>
    </ToolLayout>
  );
}
