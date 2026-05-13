import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "../globals.css";

export const promptFont = Prompt({
  subsets: ["thai"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
    >
      <body className={promptFont.className}>
        <h1 className="text-3xl font-bold underline">สวัสดี Header 2</h1>
        <hr className="my-4" />
        {children}
      </body>

    </html>
  );
}
