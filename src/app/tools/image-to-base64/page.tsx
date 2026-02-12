"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check, Upload } from "lucide-react";

export default function ImageToBase64() {
  const [base64, setBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }, []);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      setBase64(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const htmlTag = base64 ? `<img src="${base64}" alt="${fileName}" />` : "";
  const cssTag = base64 ? `background-image: url(${base64});` : "";

  return (
    <ToolLayout
      title="이미지 → Base64"
      description="이미지 파일을 Base64 문자열로 변환합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!base64 ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">이미지를 선택하거나 드래그하여 놓으세요 (최대 4MB)</span>
          </button>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <img src={base64} alt="미리보기" className="w-16 h-16 object-cover rounded border" />
              <div className="text-sm">
                <div className="font-medium">{fileName}</div>
                <div className="text-muted-foreground">
                  {(fileSize / 1024).toFixed(1)}KB → Base64: {(base64.length / 1024).toFixed(1)}KB
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                다른 이미지
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between h-9 mb-2">
                <label className="text-sm font-medium">Data URI</label>
                <Button size="sm" variant="outline" onClick={() => copy(base64)}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "복사됨" : "복사"}
                </Button>
              </div>
              <Textarea className="font-mono text-xs min-h-[80px] resize-none" value={base64} readOnly />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">HTML img 태그</label>
              <Textarea className="font-mono text-xs min-h-[60px] resize-none" value={htmlTag} readOnly />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">CSS background</label>
              <Textarea className="font-mono text-xs min-h-[60px] resize-none" value={cssTag} readOnly />
            </div>
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
