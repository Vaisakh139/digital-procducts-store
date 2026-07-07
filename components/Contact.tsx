"use client";

import { motion } from "framer-motion";
import { Clock, Mail, Send, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { submitMessage } from "@/services/messageService";
import Button from "./ui/Button";
import SectionHeading from "./ui/SectionHeading";

interface FormValues {
  name: string;
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = { name: "", email: "", message: "" };

const CONTACT_DETAILS = [
  { icon: Mail, label: "Email", value: "hello@elicso.com" },
  { icon: Clock, label: "Response time", value: "Usually within 24 hours." },
];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

export default function Contact() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setIsSubmitted(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await submitMessage(values);
      setIsSubmitted(true);
      setValues(INITIAL_VALUES);
    } catch {
      setSubmitError("Something went wrong sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="scroll-mt-20 bg-surface-muted py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Get in touch"
          title="We'd love to hear from you"
          description="Questions about a tracker, a custom request, or something not working? Send us a message."
        />

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <motion.form
            noValidate
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm lg:col-span-3"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-name"
                className="text-sm font-medium text-foreground/80"
              >
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={values.name}
                onChange={(event) => handleChange("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "contact-name-error" : undefined
                }
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-coral focus:ring-2 focus:ring-coral/30"
              />
              {errors.name ? (
                <p id="contact-name-error" className="text-xs text-red-500">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-email"
                className="text-sm font-medium text-foreground/80"
              >
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={values.email}
                onChange={(event) => handleChange("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
                placeholder="you@company.com"
                className="w-full rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-coral focus:ring-2 focus:ring-coral/30"
              />
              {errors.email ? (
                <p id="contact-email-error" className="text-xs text-red-500">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-message"
                className="text-sm font-medium text-foreground/80"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                value={values.message}
                onChange={(event) =>
                  handleChange("message", event.target.value)
                }
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message ? "contact-message-error" : undefined
                }
                placeholder="Tell us how we can help..."
                className="w-full resize-none rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-coral focus:ring-2 focus:ring-coral/30"
              />
              {errors.message ? (
                <p id="contact-message-error" className="text-xs text-red-500">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-2 w-full sm:w-fit"
              icon={<Send className="h-4 w-4" aria-hidden="true" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send Message"}
            </Button>

            {submitError ? (
              <p role="alert" className="text-sm text-red-500">
                {submitError}
              </p>
            ) : null}

            {isSubmitted ? (
              <p
                role="status"
                className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Thanks! Your message has been sent — we&apos;ll be in touch
                soon.
              </p>
            ) : null}
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="flex flex-col gap-8 rounded-2xl bg-[#fff] p-8 text-black shadow-lg lg:col-span-2"
          >
            <div>
              <h3 className="text-xl font-semibold text-black/80">
                Contact information
              </h3>
              <p className="mt-2 text-sm text-black/80">
                Reach out through any of the channels below.
              </p>
            </div>

            <ul className="flex flex-col gap-6">
              {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/15">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-mono text-xs font-medium uppercase tracking-wider text-black/70">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-black/80">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
