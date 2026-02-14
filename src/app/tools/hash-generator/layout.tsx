import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "해시 생성기",
  description: "SHA-256, SHA-512, MD5 해시를 생성합니다",
  alternates: { canonical: "/tools/hash-generator/" },
  openGraph: {
    title: "해시 생성기",
    description: "SHA-256, SHA-512, MD5 해시를 생성합니다",
    url: "/tools/hash-generator/",
  },
  twitter: {
    title: "해시 생성기 | AlphaK Tools",
    description: "SHA-256, SHA-512, MD5 해시를 생성합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
