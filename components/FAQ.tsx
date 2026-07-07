"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import SectionHeading from "./ui/SectionHeading";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do I get my file after buying?",
    answer:
      "Once your payment is confirmed, your file is available for instant download — no waiting on approvals, and we email you a direct link too.",
  },
  {
    question: "Is payment secure?",
    answer:
      "Yes. All payments are processed through encrypted, PCI-compliant payment gateways, so your card details are never stored on our servers.",
  },
  {
    question: "Can I download again?",
    answer:
      "Absolutely. Every purchase is saved to your account, so you can re-download your files anytime from your order history — no limits.",
  },
  {
    question: "Does this work in Excel or Google Sheets?",
    answer:
      "Yes. Every tracker is delivered as a ready-to-use template — just make your own copy in Google Sheets or Excel and start entering your numbers. No new software to install.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer refunds within 7 days of purchase if a product is defective or significantly not as described. Check our refund policy for full details.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Reach our team anytime through the contact form below or by email at hello@elicso.com — we typically respond within a day.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentId = useId();

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-inset"
        >
          <span>{item.question}</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-foreground/50 transition-transform duration-300 ${
              isOpen ? "rotate-180 text-coral" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={contentId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-foreground/65">
              {item.answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know before you buy a tracker or template."
        />

        <div className="mt-12 flex flex-col gap-4">
          {FAQS.map((item, index) => (
            <AccordionItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
