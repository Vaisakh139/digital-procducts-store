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
  avatarColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    role: "Freelance Designer",
    review:
      "I'd tried four different budget spreadsheets before this one. It's the first where the math is actually right and I didn't have to fix a broken formula.",
    rating: 5,
    initials: "SM",
    avatarColor: "bg-coral",
  },
  {
    name: "James Okafor",
    role: "Small Business Owner",
    review:
      "The habit tracker is stupidly simple, which is exactly why I still use it two months in. Everything else I tried got abandoned by week two.",
    rating: 5,
    initials: "JO",
    avatarColor: "bg-plum",
  },
  {
    name: "Priya Sharma",
    role: "Grad Student",
    review:
      "Bought it expecting another generic template. Got something that actually auto-calculates the numbers and looks good doing it.",
    rating: 4,
    initials: "PS",
    avatarColor: "bg-sage",
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
          description="People who were tired of tools that quit on them halfway through."
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
              className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-coral/10"
            >
              <Quote
                className="h-8 w-8 text-coral/30"
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
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${testimonial.avatarColor} text-sm font-semibold text-white`}
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
