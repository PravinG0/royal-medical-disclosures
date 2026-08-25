import { useEffect, useRef, useState } from "react";

/**
 * FDA & Compounding Disclaimers — Transparency & Disclosure section.
 *
 * The disclaimer copy below is provided verbatim by the legal reviewer.
 * Do NOT rephrase, shorten, strengthen, or add claims to this text.
 */

type Disclaimer = {
  /** Accordion navigation label (mobile only). NOT a replacement for the body text. */
  label: string;
  /** Exact, legally approved disclaimer copy. Must not be altered. */
  body: string;
};

const DISCLAIMERS: Disclaimer[] = [
  {
    label: "01 — FDA Disclaimer",
    body: "The FDA does not verify the safety, effectiveness, or quality of compounded drugs offered at our clinic.",
  },
  {
    label: "02 — Compounded Drugs",
    body: "As an alternative to FDA-approved branded products, where appropriate, a provider may prescribe a compounded drug, which is prepared by a state-licensed sterile compounding pharmacy partner. Although compounded drugs are permitted to be prescribed under federal law, they are not FDA-approved and do not undergo safety, effectiveness, or manufacturing review.",
  },
  {
    label: "03 — Personalization & Side Effects",
    body: "Claims of personalization and potential reduction in side effects are based on the ability of compounding to customize treatment for individual needs. These benefits are not guaranteed. Side effects may still occur and vary by patient.",
  },
  {
    label: "04 — Individual Results",
    body: "Compounded medications offered through this service are prescribed on an individual basis by licensed healthcare providers. While some patients may experience weight loss or other benefits, results are not guaranteed. Outcomes depend on a variety of factors including, but not limited to, patient health status, genetics, lifestyle, diet, and exercise. Neither the prescribing provider nor the pharmacy makes any promise or warranty of specific results.",
  },
];

/**
 * Adds the `is-visible` class once the section scrolls into view.
 * Animation states are only applied when the `disclosure-anim` class is
 * present (set client-side), so the content is fully visible without JS.
 */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible, mounted };
}

export function DisclosureSection() {
  const { ref, visible, mounted } = useReveal<HTMLElement>();

  // Accordion open state (mobile only). Defaults to all-open so the
  // desktop layout and no-JS / SSR render show every disclaimer openly;
  // mobile collapses items 2–4 after mount, leaving #1 visible.
  const [openItems, setOpenItems] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3]),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) {
      setOpenItems(new Set([0]));
    }
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setOpenItems(new Set([0]));
      } else {
        setOpenItems(new Set([0, 1, 2, 3]));
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section
      ref={ref}
      className={`disclosure-section ${mounted ? "disclosure-anim" : ""} ${
        visible ? "is-visible" : ""
      }`.trim()}
      aria-labelledby="disclosure-title"
    >
      <div className="disclosure-inner">
        <div className="disclosure-headline">
          <span className="disclosure-eyebrow">Important Information</span>
          <h2 id="disclosure-title" className="disclosure-title">
            FDA & Compounding Disclaimers
          </h2>
        </div>

        <div className="disclosure-rule" aria-hidden="true" />

        <ol className="disclosure-list">
          {DISCLAIMERS.map((d, i) => {
            const id = `disclosure-panel-${i}`;
            const triggerId = `disclosure-trigger-${i}`;
            const isOpen = openItems.has(i);
            return (
              <li
                key={i}
                className="disclosure-item"
                data-open={isOpen ? "true" : "false"}
                style={
                  mounted
                    ? { transitionDelay: `${0.2 + i * 0.12}s` }
                    : undefined
                }
              >
                <div className="disclosure-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="disclosure-body">
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      id={triggerId}
                      className="disclosure-trigger"
                      aria-expanded={isOpen}
                      aria-controls={id}
                      onClick={() => toggle(i)}
                    >
                      <span>{d.label}</span>
                      <svg
                        className="disclosure-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </h3>
                  <div
                    id={id}
                    className="disclosure-panel"
                    role="region"
                    aria-labelledby={triggerId}
                  >
                    <div className="disclosure-panel-inner">
                      <p className="disclosure-text">{d.body}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default DisclosureSection;
