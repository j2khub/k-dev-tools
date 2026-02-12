"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

interface HarEntry {
  request: {
    method: string;
    url: string;
    headers: { name: string; value: string }[];
  };
  response: {
    status: number;
    statusText: string;
    headers: { name: string; value: string }[];
    content: { size: number; mimeType: string };
  };
  time: number;
}

export default function HarViewer() {
  const [entries, setEntries] = useState<HarEntry[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const har = JSON.parse(e.target?.result as string);
        setEntries(har.log?.entries || []);
        setSelected(null);
      } catch {
        setEntries([]);
      }
    };
    reader.readAsText(file);
  };

  const statusColor = (status: number) => {
    if (status < 300) return "default";
    if (status < 400) return "secondary";
    return "destructive";
  };

  return (
    <ToolLayout
      title="HAR 파일 뷰어"
      description="HAR 파일을 업로드하여 HTTP 요청/응답을 분석합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept=".har"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {entries.length === 0 ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">HAR 파일을 선택하거나 드래그하여 놓으세요</span>
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {fileName} — <strong>{entries.length}</strong>개 요청
              </span>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                다른 파일
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto border rounded-md divide-y">
              {entries.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(selected === i ? null : i)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors ${selected === i ? "bg-accent" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(entry.response.status)} className="text-[10px] px-1.5">
                      {entry.response.status}
                    </Badge>
                    <span className="font-mono font-semibold">{entry.request.method}</span>
                    <span className="truncate flex-1 text-muted-foreground">
                      {new URL(entry.request.url).pathname}
                    </span>
                    <span className="text-muted-foreground">{Math.round(entry.time)}ms</span>
                  </div>
                </button>
              ))}
            </div>

            {selected !== null && entries[selected] && (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-xs block mb-1">URL</label>
                  <div className="px-3 py-2 bg-muted rounded-md font-mono text-xs break-all">
                    {entries[selected].request.url}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-xs block mb-1">요청 헤더</label>
                    <div className="px-3 py-2 bg-muted rounded-md max-h-[200px] overflow-y-auto">
                      {entries[selected].request.headers.map((h, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold">{h.name}:</span>{" "}
                          <span className="text-muted-foreground">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-xs block mb-1">응답 헤더</label>
                    <div className="px-3 py-2 bg-muted rounded-md max-h-[200px] overflow-y-auto">
                      {entries[selected].response.headers.map((h, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold">{h.name}:</span>{" "}
                          <span className="text-muted-foreground">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
