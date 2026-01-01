import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: 'account_tree',
    title: 'Instant Brackets',
    description:
      'Automatically seeds players based on current rank or completely random draw. Supports double elimination.',
  },
  {
    icon: 'bolt',
    title: 'Auto-Scoring',
    description:
      'Scores sync directly from the official FPL API after every gameweek. Live bonus point updates included.',
  },
  {
    icon: 'share',
    title: 'Shareable Links',
    description:
      'Send a single public link to your league mates to track the live bracket on any device. No login required for viewing.',
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-heading-1 font-bold mb-4">
            Everything You Need to Run a Cup
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Ditch the spreadsheets. We handle the math so you can focus on the banter.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card border-border hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6">
                {/* Icon Container */}
                <div className="bg-primary/10 text-primary rounded-xl p-3 w-fit mb-4">
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                    {feature.icon}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-heading-3 font-bold mb-2">{feature.title}</h3>

                {/* Description */}
                <p className="text-body text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
