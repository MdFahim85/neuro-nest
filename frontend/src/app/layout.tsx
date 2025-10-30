import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import { Outfit, JetBrains_Mono } from "next/font/google";
import QueryProv from "@/context/react-query-provider";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/context/auth-provider";
import Navbar from "@/components/shared/Navbar";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neuro-Nest",
  description: "LMS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.className} ${jetbrainsMono.className}`}
      suppressHydrationWarning
    >
      <body>
        <QueryProv>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="bg-neutral-100 dark:bg-neutral-900 ">
                <div className=" min-h-screen flex flex-col ">
                  <div className="md:px-20 sm:px-10 px-4 shadow-lg dark:shadow-neutral-800 border-b border-b-emerald-600 dark:border-b-emerald-300 py-2 sticky top-0 z-50 bg-neutral-100 dark:bg-neutral-900">
                    <Navbar />
                  </div>
                  <div className="md:mx-20 sm:mx-10 mx-4 ">{children}</div>
                </div>
              </div>
              <Toaster position="top-center" />
            </AuthProvider>
          </ThemeProvider>
        </QueryProv>
      </body>
    </html>
  );
}
