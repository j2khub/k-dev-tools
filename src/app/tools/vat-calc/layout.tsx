import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "부가세 계산기",
  description: "부가세(VAT) 10%를 포함하거나 분리하여 계산합니다",
  alternates: { canonical: "/tools/vat-calc/" },
  openGraph: {
    title: "부가세 계산기",
    description: "부가세(VAT) 10%를 포함하거나 분리하여 계산합니다",
    url: "/tools/vat-calc/",
  },
  twitter: {
    title: "부가세 계산기 | AlphaK Tools",
    description: "부가세(VAT) 10%를 포함하거나 분리하여 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
