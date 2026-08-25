import { useCallback, useEffect, useRef, useState } from "react";

/**
 * FDA & Compounding Disclaimers — Transparency & Disclosure section.
 *
 * The disclaimer copy below is provided verbatim by the legal reviewer.
 * Do NOT rephrase, shorten, strengthen, or add claims to this text.
 */

type Disclaimer = {
  /** Accordion navigation label (mobile only). NOT a replacement for the body text. */
  label: string;
  /** Short label used by the desktop side index. */
  short: string;
  /** Exact, legally approved disclaimer copy. Must not be altered. */
  body: string;
};

const DISCLAIMERS: Disclaimer[] = [
  {
    label: "01 — FDA Disclaimer",
    short: "FDA Disclaimer",
    body: "The FDA does not verify the safety, effectiveness, or quality of compounded drugs offered at our clinic.",
  },
  {
    label: "02 — Compounded Drugs",
    short: "Compounded Drugs",
    body: "As an alternative to FDA-approved branded products, where appropriate, a provider may prescribe a compounded drug, which is prepared by a state-licensed sterile compounding pharmacy partner. Although compounded drugs are permitted to be prescribed under federal law, they are not FDA-approved and do not undergo safety, effectiveness, or manufacturing review.",
  },
  {
    label: "03 — Personalization & Side Effects",
    short: "Personalization & Side Effects",
    body: "Claims of personalization and potential reduction in side effects are based on the ability of compounding to customize treatment for individual needs. These benefits are not guaranteed. Side effects may still occur and vary by patient.",
  },
  {
    label: "04 — Individual Results",
    short: "Individual Results",
    body: "Compounded medications offered through this service are prescribed on an individual basis by licensed healthcare providers. While some patients may experience weight loss or other benefits, results are not guaranteed. Outcomes depend on a variety of factors including, but not limited to, patient health status, genetics, lifestyle, diet, and exercise. Neither the prescribing provider nor the pharmacy makes any promise or warranty of specific results.",
  },
];

export function DisclosureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  // Accordion open state (mobile only). Defaults to all-open so the
  // desktop layout and no-JS / SSR render show every disclaimer openly.
  const [openItems, setOpenItems] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3]),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Section entrance reveal */
  useEffect(() => {
    const node = sectionRef.current;
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Mobile accordion behaviour */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) setOpenItems(new Set([0]));
    const onChange = (e: MediaQueryListEvent) => {
      setOpenItems(e.matches ? new Set([0]) : new Set([0, 1, 2, 3]));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Scroll-driven active item + rail progress */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame = 0;
    const compute = () => {
      frame = 0;
      const list = listRef.current;
      if (!list) return;
      const anchor = window.innerHeight * 0.42;
      const rect = list.getBoundingClientRect();
      const raw = (anchor - rect.top) / Math.max(rect.height, 1);
      setProgress(Math.min(1, Math.max(0, raw)));

      let next = 0;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        if (el.getBoundingClientRect().top <= anchor) next = i;
      });
      setActive(next);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const jumpTo = useCallback((index: number) => {
    const el = itemRefs.current[index];
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`disclosure-section ${mounted ? "disclosure-anim" : ""} ${
        visible ? "is-visible" : ""
      }`.trim()}
      aria-labelledby="disclosure-title"
      style={{ "--rail-progress": progress } as React.CSSProperties}
    >
      <div className="disclosure-grain" aria-hidden="true" />
      <div className="disclosure-inner">
        <div className="disclosure-aside">
          <div className="disclosure-headline">
            <span className="disclosure-eyebrow">Important Information</span>
            <h2 id="disclosure-title" className="disclosure-title">
              FDA &amp; Compounding{" "}
              <em className="disclosure-title-em">Disclaimers</em>
            </h2>
            <p className="disclosure-lede">
              Transparency first. Please read each disclosure carefully before
              beginning any compounded treatment.
            </p>
          </div>

          <nav className="disclosure-index" aria-label="Disclaimer sections">
            <div className="disclosure-counter" aria-hidden="true">
              <span className="disclosure-counter-now">
                {String(active + 1).padStart(2, "0")}
              </span>
              <span className="disclosure-counter-sep">/</span>
              <span className="disclosure-counter-all">
                {String(DISCLAIMERS.length).padStart(2, "0")}
              </span>
            </div>
            <ul>
              {DISCLAIMERS.map((d, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="disclosure-index-link"
                    data-active={i === active ? "true" : "false"}
                    onClick={() => jumpTo(i)}
                  >
                    <span className="disclosure-index-dot" aria-hidden="true" />
                    <span>{d.short}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <ol className="disclosure-list" ref={listRef}>
          <span className="disclosure-rail" aria-hidden="true">
            <span className="disclosure-rail-fill" />
          </span>
          {DISCLAIMERS.map((d, i) => {
            const id = `disclosure-panel-${i}`;
            const triggerId = `disclosure-trigger-${i}`;
            const isOpen = openItems.has(i);
            return (
              <li
                key={i}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="disclosure-item"
                data-open={isOpen ? "true" : "false"}
                data-active={i === active ? "true" : "false"}
                style={
                  mounted ? { transitionDelay: `${0.15 + i * 0.1}s` } : undefined
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
                  <p className="disclosure-kicker" aria-hidden="true">
                    {d.short}
                  </p>
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
