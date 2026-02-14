"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import type { Tool } from "@/lib/tools-list";

interface ToolCardProps {
  tool: Tool;
  variant?: "default" | "favorite";
}

export function ToolCard({ tool, variant = "default" }: ToolCardProps) {
  const { toggle, isFavorite } = useFavorites();
  const favorited = isFavorite(tool.href);

  const borderClass =
    variant === "favorite"
      ? "border-yellow-400/30 bg-yellow-400/5 hover:border-yellow-400/60"
      : "hover:border-primary/50";

  return (
    <Link
      href={tool.href}
      className={`group relative block p-5 rounded-lg border hover:shadow-sm transition-all ${borderClass}`}
    >
      <button
        type="button"
        aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        aria-pressed={favorited}
        className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-accent transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(tool.href);
        }}
      >
        <Star
          className={`h-4 w-4 ${
            favorited
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/40 group-hover:text-muted-foreground"
          } transition-colors`}
        />
      </button>
      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors pr-6">
        {tool.name}
      </h3>
      <p
        className="text-sm text-muted-foreground truncate"
        title={tool.description}
      >
        {tool.description}
      </p>
    </Link>
  );
}
