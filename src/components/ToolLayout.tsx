"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools-list";
import { useFavorites } from "@/hooks/useFavorites";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  const currentTool = tools.find((t) => t.name === title);
  const { toggle, isFavorite } = useFavorites();
  const favorited = currentTool ? isFavorite(currentTool.href) : false;

  const relatedTools = currentTool
    ? tools.filter(
        (t) => t.category === currentTool.category && t.name !== title
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        모든 도구
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {currentTool && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 ml-4"
            onClick={() => toggle(currentTool.href)}
          >
            <Star
              className={`h-5 w-5 ${
                favorited
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        )}
      </div>
      {children}
      {relatedTools.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">관련 도구</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm">{tool.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {tool.description}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
