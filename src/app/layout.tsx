import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";




export const metadata: Metadata = {
  title: "Train the Next Generation of AI as a Freelancer | Outlier AI",
  description:
    "What is Outlier? A platform for building AI with expert human input. Discover Outlier AI, join a community for freelancers, and shape the next generation of AI.",
  keywords:
    "Outlier AI, Scale AI, freelance AI training, RLHF, AI evaluator, work from home, remote coding, freelance mathematics",
  openGraph: {
    title: "Train the Next Generation of AI as a Freelancer | Outlier AI",
    description:
      "What is Outlier? A platform for building AI with expert human input. Discover Outlier AI, join a community for freelancers, and shape the next generation of AI.",
    url: "https://outlier.ai/",
    siteName: "Outlier AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Train the Next Generation of AI as a Freelancer | Outlier AI",
    description:
      "What is Outlier? A platform for building AI with expert human input. Discover Outlier AI, join a community for freelancers, and shape the next generation of AI.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fragment+Mono&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%230F172A'/><path d='M16 6L18.8 13.2L26 16L18.8 18.8L16 26L13.2 18.8L6 16L13.2 13.2L16 6Z' fill='%23FFFFFF'/></svg>"
        />
      </head>
      <body className="bg-white text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <AuthProvider>

          {children}

        </AuthProvider>
        
      </body>
    </html>
  );
}
