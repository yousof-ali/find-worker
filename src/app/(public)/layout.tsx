import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";



export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      {children}

      <CookieBanner />
      <Footer />
    </>
  );
}