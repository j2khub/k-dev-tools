"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const EMAIL = "j2kimdev@gmail.com";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Built with passion for great products.</p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 mt-1.5 hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span>{EMAIL}</span>
        </button>
      </div>
    </footer>
  );
}
