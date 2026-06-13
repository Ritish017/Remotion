import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catalyst Command Center",
  description: "AI Video Generation Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Topbar />
        <Sidebar />
        <main className="flex-1 mt-[52px] ml-[60px] xl:ml-[220px] p-6 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
