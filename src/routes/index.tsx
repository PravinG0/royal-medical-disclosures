import { createFileRoute } from "@tanstack/react-router";
import { DisclosureSection } from "@/components/disclosure-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Royal Medical Center — FDA & Compounding Disclaimers",
      },
      {
        name: "description",
        content:
          "Important FDA and compounding disclosures for Royal Medical Center. Please review this transparency information carefully.",
      },
      { property: "og:title", content: "Royal Medical Center — FDA & Compounding Disclaimers" },
      {
        property: "og:description",
        content:
          "Important FDA and compounding disclosures for Royal Medical Center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <DisclosureSection />;
}
