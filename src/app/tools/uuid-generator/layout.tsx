import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID 생성기",
  description: "랜덤 UUID v4를 생성합니다",
  alternates: { canonical: "/tools/uuid-generator/" },
  openGraph: {
    title: "UUID 생성기",
    description: "랜덤 UUID v4를 생성합니다",
    url: "/tools/uuid-generator/",
  },
  twitter: {
    title: "UUID 생성기 | AlphaK Tools",
    description: "랜덤 UUID v4를 생성합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
