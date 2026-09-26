import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">CLKAi</span>
      <h1 className="text-3xl font-bold text-ink-900">Page not found</h1>
      <p className="text-sm text-ink-500">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
          Go to Homepage
        </Link>
        <Link href="/shop" className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring">
          Shop
        </Link>
        <Link href="/contact" className="rounded-lg border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-brand-500 focus-ring">
          Contact
        </Link>
      </div>
    </div>
  );
}
