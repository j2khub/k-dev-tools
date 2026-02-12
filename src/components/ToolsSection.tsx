"use client";

import { useState } from "react";
import { tools, categories } from "@/lib/tools-list";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/ToolCard";

export function ToolsSection() {
  const [selected, setSelected] = useState<string | null>(null);

  const visibleCategories = selected
    ? categories.filter((c) => c === selected)
    : categories;

  return (
    <>
      {/* Sticky category filter bar */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/50 mb-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelected(null)}
            className={`shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors ${
              selected === null
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent border-border"
            }`}
          >
            전체
            <span className="ml-1.5 text-xs opacity-70">{tools.length}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelected(selected === category ? null : category)
              }
              className={`shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selected === category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-accent border-border"
              }`}
            >
              {category}
              <span className="ml-1.5 text-xs opacity-70">
                {tools.filter((t) => t.category === category).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tool categories and cards */}
      {visibleCategories.map((category) => (
        <section key={category} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">{category}</h2>
            <Badge variant="secondary">
              {tools.filter((t) => t.category === category).length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools
              .filter((t) => t.category === category)
              .map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
