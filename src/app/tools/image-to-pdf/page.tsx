"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, X, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface ImageItem {
  id: string;
  file: File;
  url: string;
}

type PageSize = "a4" | "letter" | "fit";

const PAGE_SIZES: { key: PageSize; label: string; width: number; height: number }[] = [
  { key: "a4", label: "A4", width: 595.28, height: 841.89 },
  { key: "letter", label: "Letter", width: 612, height: 792 },
  { key: "fit", label: "이미지 크기에 맞춤", width: 0, height: 0 },
];

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function convertToCanvasPng(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas blob 변환 실패"));
            blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
          },
          "image/png"
        );
      };
      img.onerror = () => reject(new Error("이미지 로드 실패"));
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [converting, setConverting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: ImageItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      newItems.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      });
    }
    setImages((prev) => [...prev, ...newItems]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setImages((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setConverting(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const fileType = item.file.type;
        let embeddedImage;

        if (fileType === "image/png") {
          const bytes = await readFileAsArrayBuffer(item.file);
          embeddedImage = await pdfDoc.embedPng(new Uint8Array(bytes));
        } else if (fileType === "image/jpeg" || fileType === "image/jpg") {
          const bytes = await readFileAsArrayBuffer(item.file);
          embeddedImage = await pdfDoc.embedJpg(new Uint8Array(bytes));
        } else {
          // webp, bmp, gif, etc. -> convert via canvas to PNG
          const pngBytes = await convertToCanvasPng(item.file);
          embeddedImage = await pdfDoc.embedPng(pngBytes);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === "fit") {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        } else {
          const sizeConfig = PAGE_SIZES.find((s) => s.key === pageSize)!;
          pageWidth = sizeConfig.width;
          pageHeight = sizeConfig.height;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        if (pageSize === "fit") {
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: imgWidth,
            height: imgHeight,
          });
        } else {
          // Scale to fit within page with margins
          const margin = 36; // 0.5 inch
          const availableWidth = pageWidth - margin * 2;
          const availableHeight = pageHeight - margin * 2;
          const scale = Math.min(
            availableWidth / imgWidth,
            availableHeight / imgHeight,
            1 // Don't scale up
          );
          const drawWidth = imgWidth * scale;
          const drawHeight = imgHeight * scale;
          const x = (pageWidth - drawWidth) / 2;
          const y = (pageHeight - drawHeight) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "images.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF 변환 오류:", err);
      alert("PDF 변환 중 오류가 발생했습니다.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <ToolLayout
      title="이미지 → PDF"
      description="여러 이미지를 하나의 PDF 파일로 변환합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {images.length === 0 ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">이미지를 선택하거나 드래그하여 놓으세요 (여러 개 가능)</span>
          </button>
        ) : (
          <>
            {/* Image list */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${dragging ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}`}
            >
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="relative group border rounded-lg p-2 flex flex-col items-center gap-1.5 bg-muted/30"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeImage(item.id)}
                    className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="제거"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* Thumbnail */}
                  <div className="w-full aspect-square rounded overflow-hidden bg-background flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.file.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* File name */}
                  <span className="text-xs text-muted-foreground truncate w-full text-center" title={item.file.name}>
                    {item.file.name}
                  </span>

                  {/* Reorder buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      title="위로 이동"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs text-muted-foreground leading-5">
                      {index + 1}/{images.length}
                    </span>
                    <button
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                      className="p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      title="아래로 이동"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add more button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              이미지 추가
            </Button>

            {/* Page size options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">페이지 크기</label>
              <div className="flex flex-wrap gap-2">
                {PAGE_SIZES.map((size) => (
                  <Button
                    key={size.key}
                    variant={pageSize === size.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPageSize(size.key)}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Convert button */}
            <Button
              onClick={handleConvert}
              disabled={converting || images.length === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {converting ? "변환 중..." : "변환"}
            </Button>
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
