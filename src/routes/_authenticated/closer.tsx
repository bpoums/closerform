import { createFileRoute } from "@tanstack/react-router";
import { CloserForm } from "@/components/closer-form";

export const Route = createFileRoute("/_authenticated/closer")({
  head: () => ({
    meta: [
      { title: "Closer's Form | UMS BPO Ops" },
      {
        name: "description",
        content: "Single-screen closer intake form — customer, policy and banking details in one view.",
      },
      { property: "og:title", content: "Closer's Form | UMS BPO Ops" },
      {
        property: "og:description",
        content: "Single-screen closer intake form for UMS BPO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CloserForm,
});
