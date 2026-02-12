"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import Papa from "papaparse";

export default function CsvViewer() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [filter, setFilter] = useState("");
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
      const text = e.target?.result as string;
      const result = Papa.parse(text, { skipEmptyLines: true });
      const data = result.data as string[][];
      if (data.length > 0) {
        setHeaders(data[0]);
        setRows(data.slice(1));
        setFilter("");
      }
    };
    reader.readAsText(file);
  };

  const filteredRows = useMemo(() => {
    if (!filter) return rows;
    const lower = filter.toLowerCase();
    return rows.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(lower))
    );
  }, [rows, filter]);

  return (
    <ToolLayout
      title="CSV 파일 뷰어"
      description="CSV 파일을 업로드하여 테이블로 보고 필터링합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.txt"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {rows.length === 0 ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">CSV 파일을 선택하거나 드래그하여 놓으세요</span>
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {fileName} — {rows.length}행 × {headers.length}열
              </span>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="필터..."
                className="flex-1 max-w-xs px-3 py-1.5 text-sm border rounded-md bg-transparent"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                다른 파일
              </button>
            </div>

            <div className="overflow-auto max-h-[500px] border rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRows.slice(0, 500).map((row, i) => (
                    <tr key={i} className="hover:bg-accent/50">
                      <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-1.5 font-mono">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRows.length > 500 && (
              <p className="text-xs text-muted-foreground">
                처음 500행만 표시됩니다 (전체 {filteredRows.length}행)
              </p>
            )}
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
