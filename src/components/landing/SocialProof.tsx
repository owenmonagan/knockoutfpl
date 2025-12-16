export function SocialProof() {
  return (
    <section
      data-testid="social-proof"
      className="border-t border-gray-200 bg-gray-50 px-4 py-16"
    >
      <div className="mx-auto max-w-3xl text-center">
        <blockquote>
          <p className="text-body-lg italic text-near-black">
            "Finally, FPL with actual stakes."
          </p>
          <cite className="mt-4 block text-body-sm not-italic text-gray-500">
            — Someone on Reddit, probably
          </cite>
        </blockquote>
      </div>
    </section>
  );
}
