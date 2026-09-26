export const metadata = { title: "About CLKAi" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">About CLKAi</h1>

      <div className="mt-6 flex flex-col gap-8 text-sm text-ink-700">
        <section>
          <h2 className="text-base font-semibold text-ink-900">What we do</h2>
          <p className="mt-2">
            CLKAi is an electronics retailer operating stores in Mumbai, Pune and Nashik, Maharashtra.
            We sell laptops, smartphones, tablets, accessories, networking products, computer peripherals
            and related technology, and provide repair and technical-support services for laptops,
            smartphones, tablets and other consumer technology devices.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink-900">Retail approach</h2>
          <p className="mt-2">
            We combine walk-in store sales with online ordering and store pickup where enabled, so
            customers can browse online and buy in the way that suits them.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink-900">Store presence</h2>
          <p className="mt-2">
            CLKAi currently operates stores across Mumbai, Pune and Nashik. See the{" "}
            <a href="/stores" className="text-brand-600 hover:text-brand-500">
              Store Locator
            </a>{" "}
            for current locations and services at each store. We plan to add more stores across
            Maharashtra and potentially other locations over time.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink-900">Repair and support</h2>
          <p className="mt-2">
            Our stores offer diagnosis and repair for laptops, smartphones and tablets, covering issues
            such as screen and battery replacement, charging faults, software support, and hardware
            repair. Repair terms, diagnostic fees and turnaround times are confirmed by the store after
            inspecting the device — see{" "}
            <a href="/repairs" className="text-brand-600 hover:text-brand-500">
              Repairs &amp; Services
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink-900">Values</h2>
          <p className="mt-2">
            We aim to give customers accurate product information, honest pricing, and clear
            communication about repair timelines and outcomes, without overstating what we can
            guarantee.
          </p>
        </section>
      </div>
    </div>
  );
}
