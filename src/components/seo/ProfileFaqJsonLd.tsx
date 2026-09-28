import type { ProfileFaqItem } from "@/lib/profile/profileFaq";

type ProfileFaqJsonLdProps = {
  items: ProfileFaqItem[];
  /** Stable id for the script tag (per profile). */
  scriptId: string;
};

/**
 * FAQPage JSON-LD — must use the same `items` array as ProfileFaqSection.
 */
export function ProfileFaqJsonLd({ items, scriptId }: ProfileFaqJsonLdProps) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
