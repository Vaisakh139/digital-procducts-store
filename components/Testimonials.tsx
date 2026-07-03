"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";

interface Testimonial {
  name: string;
  role: string;
  review: string;
  rating: number;
  initials: string;
  gradient: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    role: "Frontend Developer",
    review:
      "The templates saved me weeks of work. Checkout was instant and the quality is honestly unmatched for the price.",
    rating: 5,
    initials: "SM",
    gradient: "from-brand-500 to-accent-500",
  },
  {
    name: "James Okafor",
    role: "Indie Hacker",
    review:
      "Found a UI kit that fit my SaaS perfectly. Support responded within minutes when I had a licensing question.",
    rating: 5,
    initials: "JO",
    gradient: "from-accent-500 to-brand-600",
  },
  {
    name: "Priya Sharma",
    role: "Product Designer",
    review:
      "Everything about this marketplace feels premium — from browsing to secure checkout to instant download.",
    rating: 4,
    initials: "PS",
    gradient: "from-brand-400 to-brand-700",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 bg-surface-muted py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Loved by customers"
          title="What our customers say"
          description="Thousands of creators and businesses trust us for their digital product needs."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -6 }}
              className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-500/10"
            >
              <Quote
                className="h-8 w-8 text-brand-500/30"
                aria-hidden="true"
              />

              <div
                className="flex items-center gap-1"
                role="img"
                aria-label={`Rated ${testimonial.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={`h-4 w-4 ${
                      starIndex < testimonial.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-foreground/20"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/75">
                “{testimonial.review}”
              </blockquote>

              <figcaption className="flex items-center gap-3 border-t border-border-subtle pt-5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-sm font-semibold text-white`}
                  aria-hidden="true"
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-foreground/60">{testimonial.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
