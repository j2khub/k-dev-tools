"use client";

import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  content: string;
  label?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CopyButton({
  content,
  label = "복사",
  disabled,
  variant = "outline",
  size = "sm",
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => copy(content)}
      disabled={disabled || !content}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 mr-1" />
      ) : (
        <Copy className="h-3.5 w-3.5 mr-1" />
      )}
      {copied ? "복사됨" : label}
    </Button>
  );
}
