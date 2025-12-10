import '@fontsource/maple-mono'
import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`flex flex-col items-center antialiased min-h-screen w-screen`} >

        {children}

      </body>
    </html>
  );
}
