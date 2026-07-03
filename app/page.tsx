import Contact from "@/components/Contact";
import FAQ from "@/components/FAQ";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import WhyChooseUs from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
