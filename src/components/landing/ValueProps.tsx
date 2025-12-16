const valueProps = [
  {
    icon: '⚔️',
    headline: 'One opponent. One winner. Every week.',
    body: 'No more chasing points. Just survive.',
  },
  {
    icon: '🎯',
    headline: 'Your team. Higher stakes.',
    body: 'Bring your FPL squad. No setup. Just glory.',
  },
  {
    icon: '🏆',
    headline: 'Turn your league into sudden death.',
    body: '32 enter. 1 lifts the trophy.',
  },
];

export function ValueProps() {
  return (
    <section
      data-testid="value-props"
      className="bg-gray-50 px-4 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {valueProps.map((prop, index) => (
          <article
            key={index}
            className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 text-center shadow-sm"
          >
            <span className="text-5xl">{prop.icon}</span>
            <h3 className="text-heading-3 font-semibold text-near-black">
              {prop.headline}
            </h3>
            <p className="text-body text-gray-500">{prop.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
