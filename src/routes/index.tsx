import { createFileRoute } from "@tanstack/react-router";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PainPoints } from "@/components/landing/PainPoints";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Companions } from "@/components/landing/Companions";
import { EmotionalEating } from "@/components/landing/EmotionalEating";
import { GrowthDashboard } from "@/components/landing/GrowthDashboard";
import { EmergencyMode } from "@/components/landing/EmergencyMode";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

const TITLE = "JN-CALM — Ruang Curhat & Refleksi Diri yang Aman";
const DESC =
  "JN-CALM adalah ruang aman interaktif untuk membantumu mengatasi overthinking, stres, burnout, dan emotional eating. Tempat aman untuk curhat, bertumbuh, dan memahami diri.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "JN-CALM",
          description: DESC,
          applicationCategory: "HealthApplication",
          inLanguage: "id-ID",
          operatingSystem: "iOS, Android, Web",
          offers: {
            "@type": "Offer",
            price: "49000",
            priceCurrency: "IDR",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  useRevealOnScroll();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Companions />
        <EmotionalEating />
        <GrowthDashboard />
        <EmergencyMode />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
