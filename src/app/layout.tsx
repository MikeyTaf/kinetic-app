import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kinetic",
  description: "Generate Proof Tiles from your GitHub work.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.tailwindcss.com" />
      </head>
      <body className={`${inter.className} bg-slate-900 text-slate-300`}>
        {children}
      </body>
    </html>
  );
}