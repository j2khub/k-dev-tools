"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { loadRhwp, ensureRhwpFonts } from "@/lib/rhwp-client";

interface DocSection {
  index: number;
  paragraphs: DocParagraph[];
}

interface DocParagraph {
  type: "text" | "table";
  text?: string;
  rows?: string[][];
}

interface DocMeta {
  title?: string;
  creator?: string;
  subject?: string;
  date?: string;
}

interface DocImage {
  name: string;
  url: string;
}

interface DocResult {
  meta: DocMeta;
  sections: DocSection[];
  images: DocImage[];
  fileSize: number;
  format: "hwp" | "hwpx";
}

export default function HwpViewerPage() {
  const [result, setResult] = useState<DocResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"formatted" | "text" | "rendered">(
    "text"
  );
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );
  const [fileName, setFileName] = useState("");

  const [renderState, setRenderState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderedSvgs, setRenderedSvgs] = useState<string[] | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const imageUrlsRef = useRef<string[]>([]);
  const rawBufferRef = useRef<ArrayBuffer | null>(null);

  const cleanup = useCallback(() => {
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    imageUrlsRef.current = [];
  }, []);

  // ── HWPX 파싱 (ZIP + XML) ──

  const extractTextFromParagraph = (pEl: Element): string => {
    const parts: string[] = [];
    const allRuns = Array.from(pEl.children).filter(
      (c) => c.localName === "run"
    );
    for (const run of allRuns) {
      for (const child of Array.from(run.children)) {
        if (child.localName === "t") {
          for (const node of Array.from(child.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
              parts.push(node.textContent || "");
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              const tag = el.localName;
              if (tag === "tab") parts.push("\t");
              else if (tag === "lineBreak") parts.push("\n");
              else if (tag === "nbSpace" || tag === "fwSpace") parts.push(" ");
            }
          }
        }
      }
    }
    return parts.join("");
  };

  const extractTable = (tblEl: Element): string[][] => {
    const rows: string[][] = [];
    for (const tr of Array.from(tblEl.children).filter(
      (c) => c.localName === "tr"
    )) {
      const cells: string[] = [];
      for (const tc of Array.from(tr.children).filter(
        (c) => c.localName === "tc"
      )) {
        const cellTexts: string[] = [];
        const subList = Array.from(tc.children).find(
          (c) => c.localName === "subList"
        );
        if (subList) {
          for (const p of Array.from(subList.children).filter(
            (c) => c.localName === "p"
          )) {
            const t = extractTextFromParagraph(p);
            if (t) cellTexts.push(t);
          }
        }
        cells.push(cellTexts.join("\n"));
      }
      rows.push(cells);
    }
    return rows;
  };

  const parseSectionXml = (xmlText: string, index: number): DocSection => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    const paragraphs: DocParagraph[] = [];
    const root = doc.documentElement;

    for (const p of Array.from(root.children).filter(
      (c) => c.localName === "p"
    )) {
      const runs = Array.from(p.children).filter(
        (c) => c.localName === "run"
      );
      let hasTable = false;
      for (const run of runs) {
        const tbl = Array.from(run.children).find(
          (c) => c.localName === "tbl"
        );
        if (tbl) {
          const text = extractTextFromParagraph(p);
          if (text.trim()) paragraphs.push({ type: "text", text });
          paragraphs.push({ type: "table", rows: extractTable(tbl) });
          hasTable = true;
        }
      }
      if (!hasTable) {
        const text = extractTextFromParagraph(p);
        if (text.trim()) paragraphs.push({ type: "text", text });
      }
    }
    return { index, paragraphs };
  };

  const parseHwpxMetadata = (xmlText: string): DocMeta => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    const meta: DocMeta = {};
    const metaEl = Array.from(doc.documentElement.children).find(
      (c) => c.localName === "metadata"
    );
    if (metaEl) {
      for (const child of Array.from(metaEl.children)) {
        const tag = child.localName;
        const name = child.getAttribute("name");
        if (tag === "title") meta.title = child.textContent || undefined;
        else if (tag === "meta" && name === "creator")
          meta.creator = child.textContent || undefined;
        else if (tag === "meta" && name === "subject")
          meta.subject = child.textContent || undefined;
        else if (tag === "meta" && name === "date")
          meta.date = child.textContent || undefined;
      }
    }
    return meta;
  };

  const parseHwpx = async (file: File): Promise<DocResult> => {
    const { unzipSync } = await import("fflate");
    const buffer = await file.arrayBuffer();
    const unzipped = unzipSync(new Uint8Array(buffer));
    const decoder = new TextDecoder("utf-8");

    let meta: DocMeta = {};
    const contentHpf = unzipped["Contents/content.hpf"];
    if (contentHpf) meta = parseHwpxMetadata(decoder.decode(contentHpf));

    const sectionFiles = Object.keys(unzipped)
      .filter(
        (k) => k.startsWith("Contents/section") && k.endsWith(".xml")
      )
      .sort((a, b) => {
        const numA = parseInt(a.replace("Contents/section", "").replace(".xml", ""));
        const numB = parseInt(b.replace("Contents/section", "").replace(".xml", ""));
        return numA - numB;
      });

    if (sectionFiles.length === 0) throw new Error("섹션 데이터를 찾을 수 없습니다.");

    const sections: DocSection[] = sectionFiles.map((f, i) =>
      parseSectionXml(decoder.decode(unzipped[f]), i)
    );

    const images: DocImage[] = [];
    const imgExts = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"];
    for (const [path, data] of Object.entries(unzipped)) {
      if (
        path.startsWith("BinData/") &&
        imgExts.some((ext) => path.toLowerCase().endsWith(ext))
      ) {
        const blob = new Blob([new Uint8Array(data)]);
        const url = URL.createObjectURL(blob);
        imageUrlsRef.current.push(url);
        images.push({ name: path.replace("BinData/", ""), url });
      }
    }

    setExpandedSections(new Set(sections.map((_, i) => i)));
    return { meta, sections, images, fileSize: file.size, format: "hwpx" };
  };

  // ── HWP 파싱 (hwp.js) ──

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const extractHwpParagraphText = (paragraph: any): string => {
    if (!paragraph?.content) return "";
    return paragraph.content
      .filter((c: any) => typeof c.value === "string")
      .map((c: any) => c.value as string)
      .join("");
  };

  const extractHwpTable = (control: any): string[][] => {
    const rows: string[][] = [];
    if (!control?.content) return rows;
    for (const row of control.content) {
      const cells: string[] = [];
      if (!Array.isArray(row)) continue;
      for (const cell of row) {
        const items = cell?.items || cell?.content || [];
        const cellText = (Array.isArray(items) ? items : [])
          .map((p: any) => extractHwpParagraphText(p))
          .filter(Boolean)
          .join("\n");
        cells.push(cellText);
      }
      rows.push(cells);
    }
    return rows;
  };

  const parseHwp = async (file: File): Promise<DocResult> => {
    const { parse } = await import("hwp.js") as any;
    const buffer = await file.arrayBuffer();
    const doc = parse(new Uint8Array(buffer), { type: "array" });

    const sections: DocSection[] = [];

    for (let si = 0; si < doc.sections.length; si++) {
      const section = doc.sections[si];
      const paragraphs: DocParagraph[] = [];

      for (const paragraph of section.content) {
        // 테이블 추출
        if (paragraph.controls && paragraph.controls.length > 0) {
          for (const control of paragraph.controls) {
            // 테이블 감지: rowCount/columnCount 속성 또는 content가 2D 배열
            if (
              control.rowCount != null &&
              control.columnCount != null &&
              control.content
            ) {
              const text = extractHwpParagraphText(paragraph);
              if (text.trim()) paragraphs.push({ type: "text", text });
              const rows = extractHwpTable(control);
              if (rows.length > 0) paragraphs.push({ type: "table", rows });
            }
          }
          // 테이블이 없었으면 일반 텍스트로
          const hasTable = paragraph.controls.some(
            (c: any) => c.rowCount != null && c.content
          );
          if (!hasTable) {
            const text = extractHwpParagraphText(paragraph);
            if (text.trim()) paragraphs.push({ type: "text", text });
          }
        } else {
          const text = extractHwpParagraphText(paragraph);
          if (text.trim()) paragraphs.push({ type: "text", text });
        }
      }

      sections.push({ index: si, paragraphs });
    }

    // 이미지 추출
    const images: DocImage[] = [];
    if (doc.info?.binData) {
      for (let i = 0; i < doc.info.binData.length; i++) {
        const bin = doc.info.binData[i];
        if (bin?.payload && bin.payload.length > 0) {
          const ext = bin.extension || "png";
          const blob = new Blob([bin.payload], {
            type: `image/${ext === "jpg" ? "jpeg" : ext}`,
          });
          const url = URL.createObjectURL(blob);
          imageUrlsRef.current.push(url);
          images.push({ name: `image-${i + 1}.${ext}`, url });
        }
      }
    }

    setExpandedSections(new Set(sections.map((_, i) => i)));
    return { meta: {}, sections, images, fileSize: file.size, format: "hwp" };
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // ── 공통 핸들러 ──

  const handleFile = useCallback(
    async (file: File) => {
      const isHwp = file.name.toLowerCase().endsWith(".hwp");
      const isHwpx = file.name.toLowerCase().endsWith(".hwpx");

      if (!isHwp && !isHwpx) {
        setError("HWP 또는 HWPX 파일만 지원합니다.");
        return;
      }

      cleanup();
      setLoading(true);
      setError(null);
      setResult(null);
      setFileName(file.name);
      setRenderState("idle");
      setRenderError(null);
      setRenderedSvgs(null);
      rawBufferRef.current = null;

      try {
        rawBufferRef.current = await file.arrayBuffer();
        const parsed = isHwpx ? await parseHwpx(file) : await parseHwp(file);
        setResult(parsed);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "파일을 읽을 수 없습니다.";
        setError(
          `파싱 실패: ${msg}${isHwp ? "\n(암호화되거나 지원하지 않는 형식일 수 있습니다)" : ""}`
        );
      } finally {
        setLoading(false);
      }
    },
    [cleanup]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const getPlainText = (): string => {
    if (!result) return "";
    const lines: string[] = [];
    for (const section of result.sections) {
      for (const p of section.paragraphs) {
        if (p.type === "text") {
          lines.push(p.text || "");
        } else if (p.type === "table" && p.rows) {
          for (const row of p.rows) lines.push(row.join("\t"));
          lines.push("");
        }
      }
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    const text = getPlainText();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadText = () => {
    const text = getPlainText();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.download = fileName.replace(/\.hwpx?$/i, "") + ".txt";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const doRenderSvg = useCallback(async () => {
    if (!rawBufferRef.current) return;
    setRenderState("loading");
    setRenderError(null);
    try {
      await ensureRhwpFonts();
      const mod = await loadRhwp();
      const doc = new mod.HwpDocument(new Uint8Array(rawBufferRef.current));
      const total = doc.pageCount();
      const limit = Math.min(total, 50);
      const svgs: string[] = [];
      for (let i = 0; i < limit; i++) {
        svgs.push(doc.renderPageSvg(i));
      }
      doc.free();
      const DOMPurify = (await import("isomorphic-dompurify")).default;
      const safe = svgs.map((s) =>
        DOMPurify.sanitize(s, { USE_PROFILES: { svg: true, svgFilters: true } })
      );
      setRenderedSvgs(safe);
      setRenderState("done");
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : "렌더링 실패");
      setRenderState("error");
    }
  }, []);

  useEffect(() => {
    if (viewMode === "rendered" && renderState === "idle" && rawBufferRef.current) {
      void doRenderSvg();
    }
  }, [viewMode, renderState, doRenderSvg]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ToolLayout
      title="HWP 뷰어"
      description="HWP/HWPX 파일의 텍스트, 표, 이미지를 추출하여 표시합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept=".hwp,.hwpx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {!result && !loading ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`w-full flex flex-col items-center justify-center gap-3 p-12 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent"
              }`}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  HWP/HWPX 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  HWP 5.0 (바이너리) · HWPX (XML) 지원
                </p>
              </div>
            </button>
            {error && (
              <p className="text-sm text-destructive text-center whitespace-pre-line">
                {error}
              </p>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">파싱 중...</p>
          </div>
        ) : result ? (
          <>
            {/* 파일 정보 + 컨트롤 */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatFileSize(result.fileSize)} · {result.format.toUpperCase()})
                </span>
              </div>

              <div className="inline-flex rounded-md border text-xs ml-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("formatted")}
                  className={`px-3 py-1.5 rounded-l-md transition-colors ${
                    viewMode === "formatted"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  서식
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("text")}
                  className={`px-3 py-1.5 transition-colors border-x ${
                    viewMode === "text"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  텍스트
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("rendered")}
                  className={`px-3 py-1.5 rounded-r-md transition-colors ${
                    viewMode === "rendered"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  title="원본 레이아웃을 SVG로 렌더링 (최초 클릭 시 WASM 3.5MB 로드)"
                >
                  문서 렌더링
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                복사
              </button>
              <button
                type="button"
                onClick={handleDownloadText}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors"
              >
                <Download className="h-3 w-3" /> TXT
              </button>
              <button
                type="button"
                onClick={() => {
                  cleanup();
                  setResult(null);
                  setError(null);
                  setFileName("");
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors"
              >
                새 파일
              </button>
            </div>

            {/* 메타데이터 */}
            {(result.meta.title ||
              result.meta.creator ||
              result.meta.date) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground px-1">
                {result.meta.title && <span>제목: {result.meta.title}</span>}
                {result.meta.creator && (
                  <span>작성자: {result.meta.creator}</span>
                )}
                {result.meta.date && (
                  <span>
                    날짜: {new Date(result.meta.date).toLocaleDateString("ko")}
                  </span>
                )}
              </div>
            )}

            {/* 내용 */}
            {viewMode === "formatted" ? (
              <div className="space-y-1">
                {result.sections.map((section) => (
                  <div key={section.index} className="border rounded-lg">
                    {result.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => toggleSection(section.index)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                      >
                        {expandedSections.has(section.index) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        섹션 {section.index + 1}
                        <span className="text-muted-foreground font-normal">
                          ({section.paragraphs.length}개 항목)
                        </span>
                      </button>
                    )}
                    {(result.sections.length === 1 ||
                      expandedSections.has(section.index)) && (
                      <div className="px-4 py-3 space-y-2">
                        {section.paragraphs.map((p, pi) =>
                          p.type === "text" ? (
                            <p
                              key={pi}
                              className="text-sm leading-relaxed whitespace-pre-wrap"
                            >
                              {p.text}
                            </p>
                          ) : p.rows && p.rows.length > 0 ? (
                            <div
                              key={pi}
                              className="overflow-x-auto rounded border my-2"
                            >
                              <table className="min-w-full text-xs">
                                <tbody>
                                  {p.rows.map((row, ri) => (
                                    <tr
                                      key={ri}
                                      className={
                                        ri === 0
                                          ? "bg-muted/50 font-medium"
                                          : "border-t"
                                      }
                                    >
                                      {row.map((cell, ci) => (
                                        <td
                                          key={ci}
                                          className="px-2 py-1.5 whitespace-pre-wrap"
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : null
                        )}
                        {section.paragraphs.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">
                            (빈 섹션)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : viewMode === "text" ? (
              <pre className="p-4 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap break-all max-h-[600px] overflow-y-auto font-mono">
                {getPlainText()}
              </pre>
            ) : (
              <div className="rounded-lg border bg-muted/20 p-3">
                {renderState === "loading" && (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      WASM 로드 및 문서 렌더링 중...
                    </p>
                  </div>
                )}
                {renderState === "error" && (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-sm text-destructive">
                      렌더링 실패: {renderError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRenderState("idle");
                        setRenderedSvgs(null);
                      }}
                      className="text-xs underline text-muted-foreground"
                    >
                      다시 시도
                    </button>
                  </div>
                )}
                {renderState === "done" && renderedSvgs && (
                  <div className="space-y-3 max-h-[800px] overflow-y-auto">
                    <p className="text-xs text-muted-foreground px-2">
                      {renderedSvgs.length}개 페이지 (원본 레이아웃 렌더링)
                    </p>
                    {renderedSvgs.map((svg, i) => (
                      <div
                        key={i}
                        className="bg-white rounded border overflow-auto [&_svg]:max-w-full [&_svg]:h-auto"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 이미지 */}
            {result.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4" />
                  첨부 이미지 ({result.images.length}개)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {result.images.map((img, i) => (
                    <a
                      key={i}
                      href={img.url}
                      download={img.name}
                      className="group border rounded-lg overflow-hidden hover:border-primary transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-24 object-contain bg-muted/30 p-1"
                      />
                      <p className="text-[10px] text-muted-foreground px-1.5 py-1 truncate group-hover:text-primary">
                        {img.name}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </Card>
    </ToolLayout>
  );
}
