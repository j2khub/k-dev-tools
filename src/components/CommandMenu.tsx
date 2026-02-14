"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { tools } from "@/lib/tools-list";
import { Search, CalendarDays, CloudSun } from "lucide-react";

const pageLinks = [
  {
    name: "날씨",
    description: "주요 도시 현재 날씨, 7일 예보, 시간별 기온",
    href: "/weather",
    keywords: "날씨 weather 기온 예보 서울 부산",
  },
  {
    name: "공휴일 달력",
    description: "국가별 공휴일 확인, 월별 달력 뷰, D-day 표시",
    href: "/calendar",
    keywords: "달력 공휴일 holiday calendar",
  },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-md hover:bg-accent transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>검색...</span>
        <kbd className="ml-2 hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="도구 및 페이지 검색">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-[10%] sm:top-[20%] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg">
            <Command className="bg-popover border rounded-lg shadow-lg overflow-hidden">
              <Command.Input
                ref={inputRef}
                autoFocus
                placeholder="도구 또는 페이지 검색..."
                className="w-full px-4 py-3 text-sm bg-transparent border-b outline-none placeholder:text-muted-foreground"
              />
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  검색 결과가 없습니다
                </Command.Empty>
                <Command.Group heading="페이지" className="px-1 py-1.5 text-xs font-medium text-muted-foreground">
                  {pageLinks.map((page) => (
                    <Command.Item
                      key={page.href}
                      value={`${page.name} ${page.keywords}`}
                      onSelect={() => {
                        router.push(page.href);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer data-[selected=true]:bg-accent"
                    >
                      {page.href === "/weather" ? (
                        <CloudSun className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{page.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {page.description}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading="도구" className="px-1 py-1.5 text-xs font-medium text-muted-foreground">
                  {tools.map((tool) => (
                    <Command.Item
                      key={tool.href}
                      value={tool.name}
                      onSelect={() => {
                        router.push(tool.href);
                        setOpen(false);
                      }}
                      className="flex flex-col gap-0.5 px-3 py-2 rounded-md text-sm cursor-pointer data-[selected=true]:bg-accent"
                    >
                      <span className="font-medium">{tool.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tool.description}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
