import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-midnight px-4 py-16 md:py-20 lg:py-32">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-display-xl">
          KNOCKOUT FPL
        </h1>
        <p className="max-w-[42rem] text-body-lg text-gold-light">
          Every gameweek is a cup final.
        </p>
      </div>

      <div className="mt-10">
        <Link
          to="/signup"
          className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-lg bg-gold px-8 text-lg font-semibold text-near-black shadow-gold transition-colors hover:bg-gold-light"
        >
          Enter the Arena
        </Link>
      </div>
    </section>
  );
}
