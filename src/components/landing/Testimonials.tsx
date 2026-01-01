import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  name: string;
  handle: string;
  initials: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Alex Johnson',
    handle: '@FPL_AlexJ',
    initials: 'AJ',
    quote:
      'Made our office league 10x more interesting. The live updates during the games make the group chat explode. Best addition to the season.',
  },
  {
    name: 'Sarah Miller',
    handle: '@SoccerSarah99',
    initials: 'SM',
    quote:
      'Finally, a way to settle the H2H debate without manual tracking. It handles all the bench boosts and chip calculations perfectly.',
  },
  {
    name: 'Mike Davies',
    handle: '@LeagueAdminMike',
    initials: 'MD',
    quote:
      'Set it up in 5 minutes for our mini-league of 20 people. The bracket generation was instant and fair. Highly recommended.',
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 text-primary" role="img" aria-label="5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-lg" aria-hidden="true">
          &#9733;
        </span>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-heading-1 font-bold mb-4">
            What Managers Are Saying
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by over 5,000 mini-leagues worldwide
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.handle}
              className="bg-card border-border hover:border-primary/20 transition-colors"
            >
              <CardContent className="p-6">
                {/* Header: Avatar + Name + Handle */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-body font-medium text-muted-foreground">
                      {testimonial.initials}
                    </span>
                  </div>

                  {/* Name and Handle */}
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-body-sm text-primary">{testimonial.handle}</p>
                  </div>
                </div>

                {/* Stars */}
                <StarRating />

                {/* Quote */}
                <p className="mt-4 text-body text-muted-foreground italic">
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
