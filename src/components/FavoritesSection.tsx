"use client";

import { Star } from "lucide-react";
import { tools } from "@/lib/tools-list";
import { useFavorites } from "@/hooks/useFavorites";
import { ToolCard } from "@/components/ToolCard";

export function FavoritesSection() {
  const { favorites } = useFavorites();

  const favoriteTools = tools.filter((t) => favorites.includes(t.href));

  if (favoriteTools.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <h2 className="text-xl font-semibold">즐겨찾기</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoriteTools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} variant="favorite" />
        ))}
      </div>
    </section>
  );
}
