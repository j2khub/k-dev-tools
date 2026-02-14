import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EUC-KR ↔ UTF-8",
  description: "EUC-KR과 UTF-8 인코딩을 상호 변환합니다",
  alternates: { canonical: "/tools/euckr-utf8/" },
  openGraph: {
    title: "EUC-KR ↔ UTF-8",
    description: "EUC-KR과 UTF-8 인코딩을 상호 변환합니다",
    url: "/tools/euckr-utf8/",
  },
  twitter: {
    title: "EUC-KR ↔ UTF-8 | AlphaK Tools",
    description: "EUC-KR과 UTF-8 인코딩을 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
