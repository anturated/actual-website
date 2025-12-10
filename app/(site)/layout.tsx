import type { Metadata } from "next";
import '@fontsource/maple-mono'
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Desant",
  description: "Web site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`flex flex-col items-center antialiased min-h-screen`} >
        <Header />
        <main className="flex flex-col flex-grow items-center gap-[75px] max-w-md w-sm md:w-full mx-auto">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
