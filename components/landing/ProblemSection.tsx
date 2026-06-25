import { Card } from "@/components/ui/Card";

const problems = [
  "I don't know who I should talk to.",
  "I forgot that person's name.",
  "I forgot what we talked about.",
  "I left with no concrete follow-up plan.",
];

export function ProblemSection() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text-main">
        Networking events fail after the handshake
      </h2>
      <div className="flex flex-col gap-2">
        {problems.map((problem) => (
          <Card key={problem} variant="soft" className="py-3">
            <p className="text-sm text-text-muted">&ldquo;{problem}&rdquo;</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
