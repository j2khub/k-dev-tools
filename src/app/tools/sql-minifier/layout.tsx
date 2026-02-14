import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL 미니파이어",
  description: "SQL 쿼리에서 주석과 공백을 제거하여 압축합니다",
  alternates: { canonical: "/tools/sql-minifier/" },
  openGraph: {
    title: "SQL 미니파이어",
    description: "SQL 쿼리에서 주석과 공백을 제거하여 압축합니다",
    url: "/tools/sql-minifier/",
  },
  twitter: {
    title: "SQL 미니파이어 | AlphaK Tools",
    description: "SQL 쿼리에서 주석과 공백을 제거하여 압축합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
