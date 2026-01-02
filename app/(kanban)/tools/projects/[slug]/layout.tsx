import type { Metadata } from "next";
import '@fontsource/maple-mono'
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Desant",
  description: "Kanban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`flex flex-col items-center antialiased min-h-screen`} >
        <main className="flex flex-col flex-grow items-center w-full mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
