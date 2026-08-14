import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UMS Closer's Form | Fast Policy Intake" },
      {
        name: "description",
        content:
          "Single-screen closer intake form for UMS BPO — capture customer, policy and banking details and sync them straight to Google Sheets.",
      },
      { property: "og:title", content: "UMS Closer's Form | Fast Policy Intake" },
      {
        property: "og:description",
        content:
          "Single-screen closer intake form for UMS BPO — capture customer, policy and banking details and sync them straight to Google Sheets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CloserForm,
});

const WEBHOOK_URL = "https://umsbpo.app.n8n.cloud/webhook/ums-closer-form";

type FieldType = "text" | "number" | "date" | "radio" | "textarea";

type Field = {
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  span?: string;
};

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: "Customer",
    fields: [
      { label: "Closer ID", type: "text", required: true },
      { label: "Customer Full Name", type: "text", required: true },
      { label: "Customer Phone", type: "number" },
      { label: "Customer D.O.B", type: "date", required: true },
      { label: "Customer Age", type: "number" },
      { label: "Customer Address", type: "text", required: true },
      { label: "Customer City", type: "text", required: true },
      { label: "Customer State", type: "text" },
      { label: "Customer Zip Code", type: "number", required: true },
      { label: "Born in which State?", type: "text", required: true },
    ],
  },
  {
    title: "Policy",
    fields: [
      { label: "Insurance Carrier", type: "text" },
      { label: "Coverage Amount", type: "number" },
      { label: "Ins. Premium", type: "text" },
      {
        label: "Ins. Plan Type",
        type: "radio",
        options: ["Level", "Graded / Mod", "G.I"],
        span: "sm:col-span-2",
      },
      {
        label: "Tobacco Usage",
        type: "radio",
        required: true,
        options: ["YES", "NO", "Willing to Quit"],
        span: "sm:col-span-2",
      },
      {
        label: "Doctor / Physician - Name(s) + Info",
        type: "text",
        span: "sm:col-span-2",
      },
      {
        label: "Beneificiary Name(s) + Info",
        type: "text",
        required: true,
        span: "sm:col-span-2",
      },
    ],
  },
  {
    title: "Banking",
    fields: [
      { label: "S.S.N", type: "number", required: true },
      { label: "Draft Date", type: "date", required: true },
      { label: "Customer Bank Name", type: "text", required: true },
      { label: "Bank Routing Number", type: "number", required: true },
      { label: "Bank Account Number", type: "text", required: true },
      {
        label: "Account Type",
        type: "radio",
        required: true,
        options: ["Checking", "Saving"],
      },
      { label: "Note & Comment", type: "textarea", span: "sm:col-span-2" },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

function emptyForm(): Record<string, string> {
  return Object.fromEntries(ALL_FIELDS.map((f) => [f.label, ""]));
}

function CloserForm() {
  const [values, setValues] = useState<Record<string, string>>(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (label: string, value: string) =>
    setValues((prev) => ({ ...prev, [label]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setStatus("sent");
      setMessage("Submission saved to the sheet.");
      setValues(emptyForm());
      window.setTimeout(() => setStatus("idle"), 4000);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not submit.");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground lg:h-screen lg:overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex h-full max-w-[1500px] flex-col gap-3 px-4 py-4 lg:gap-4 lg:px-8 lg:py-5"
      >
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-accent">
              UMS BPO
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
              Closer&apos;s Form
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {message ? (
              <span
                className={
                  status === "error"
                    ? "text-xs font-medium text-destructive"
                    : "text-xs font-medium text-accent"
                }
              >
                {message}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                All fields sync directly to Google Sheets
              </span>
            )}
            <button type="submit" className="btn-submit" disabled={status === "sending"}>
              {status === "sending" ? "Submitting…" : "Submit entry"}
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-3 lg:min-h-0 lg:grid-cols-12 lg:gap-4">
          {SECTIONS.map((section, index) => (
            <section
              key={section.title}
              className={`panel ${index === 1 ? "lg:col-span-5" : index === 0 ? "lg:col-span-4" : "lg:col-span-3"}`}
            >
              <h2 className="panel-title">{section.title}</h2>
              <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <FieldControl
                    key={field.label}
                    field={field}
                    value={values[field.label] ?? ""}
                    onChange={(v) => set(field.label, v)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </form>
    </main>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = field.label.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

  const hint = (() => {
    if (!value) return null;
    if (field.label === "Customer D.O.B") {
      const sign = zodiacSign(value);
      return sign ? { tone: "info" as const, text: `${sign.symbol} ${sign.name}` } : null;
    }
    if (field.label === "Draft Date") {
      const d = new Date(`${value}T00:00:00`);
      if (Number.isNaN(d.getTime())) return null;
      if (d.getDay() === 6) return { tone: "warn" as const, text: "⚠ It's Saturday" };
      if (d.getDay() === 0) return { tone: "danger" as const, text: "⛔ It's Sunday" };
      return null;
    }
    return null;
  })();

  return (
    <div className={`flex flex-col gap-1 ${field.span ?? ""}`}>
      <label htmlFor={id} className="field-label">
        {field.label}
        {field.required ? <span className="text-accent"> *</span> : null}
      </label>


      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field-input resize-none"
        />
      ) : field.type === "radio" ? (
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={value === option}
              className={value === option ? "chip chip-active" : "chip"}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <input
          id={id}
          type={field.type === "number" ? "text" : field.type}
          inputMode={field.type === "number" ? "numeric" : undefined}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field-input"
        />
      )}
    </div>
  );
}
