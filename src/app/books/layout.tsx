import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "베스트셀러 도서",
  description:
    "알라딘 베스트셀러, 신간, 블로거 추천 도서 목록을 확인하세요.",
  alternates: { canonical: "/books/" },
  openGraph: {
    title: "베스트셀러 도서",
    description: "알라딘 베스트셀러, 신간, 블로거 추천 도서 목록",
    url: "/books",
  },
  twitter: {
    title: "베스트셀러 도서 | AlphaK Tools",
    description: "알라딘 베스트셀러, 신간, 블로거 추천 도서 목록",
  },
};

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
