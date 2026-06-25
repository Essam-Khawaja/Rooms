const steps = [
  {
    step: "1",
    title: "Enter the room",
    description: "Claim your profile from the attendee list.",
  },
  {
    step: "2",
    title: "Explore the graph",
    description: "See everyone as a live social map.",
  },
  {
    step: "3",
    title: "Mark conversations",
    description: "Tap a node, hit Met, add a quick note.",
  },
  {
    step: "4",
    title: "Leave with a plan",
    description: "Get a follow-up list and suggested actions.",
  },
];

export function HowItWorks() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text-main">How it works</h2>
      <div className="grid gap-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="flex gap-4 rounded-2xl border border-border bg-surface-soft p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
              {item.step}
            </span>
            <div>
              <p className="font-medium text-text-main">{item.title}</p>
              <p className="text-sm text-text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
