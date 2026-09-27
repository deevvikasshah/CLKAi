import Link from "next/link";
import { submitContactForm } from "@/app/actions/publicEnquiries";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = { title: "Contact" };

export default function ContactPage({ searchParams }: { searchParams: { submitted?: string } }) {
  const hasAnyContact = siteConfig.contact.phone || siteConfig.contact.whatsapp || siteConfig.contact.email;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Contact</h1>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Reach us directly</h2>
          {hasAnyContact ? (
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink-700">
              {siteConfig.contact.phone && <li>Phone: {siteConfig.contact.phone}</li>}
              {siteConfig.contact.whatsapp && <li>WhatsApp: {siteConfig.contact.whatsapp}</li>}
              {siteConfig.contact.email && <li>Email: {siteConfig.contact.email}</li>}
              {siteConfig.contact.registeredAddress && <li>Address: {siteConfig.contact.registeredAddress}</li>}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-500">
              Official contact details will appear here once confirmed by CLKAi. In the meantime, use the{" "}
              <Link href="/stores" className="underline hover:text-brand-600">
                Store Locator
              </Link>{" "}
              to reach a specific store.
            </p>
          )}

          <h2 className="mt-6 text-sm font-semibold text-ink-900">Other ways to reach us</h2>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            <li>
              <Link href="/stores" className="text-brand-600 hover:text-brand-500">
                Find a store near you
              </Link>
            </li>
            <li>
              <Link href="/repairs" className="text-brand-600 hover:text-brand-500">
                Book a repair
              </Link>
            </li>
            <li>
              <Link href="/corporate" className="text-brand-600 hover:text-brand-500">
                Corporate / bulk enquiry
              </Link>
            </li>
          </ul>
        </div>

        <div>
          {searchParams.submitted === "1" ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Thank you — your message has been received.
            </div>
          ) : (
            <form action={submitContactForm} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-ink-700">
                  Name
                </label>
                <input id="name" name="name" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-ink-700">
                  Email
                </label>
                <input id="email" name="email" type="email" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-ink-700">
                  Phone (optional)
                </label>
                <input id="phone" name="phone" className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-medium text-ink-700">
                  Message
                </label>
                <textarea id="message" name="message" required rows={4} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
              </div>
              <label className="flex items-start gap-2 text-xs text-ink-500">
                <input type="checkbox" name="marketingConsent" className="mt-0.5" />
                I&rsquo;d like to receive marketing communication from CLKAi. This is optional.
              </label>
              <p className="text-xs text-ink-500">
                See our{" "}
                <Link href="/policies/privacy" className="underline hover:text-brand-600 focus-ring">
                  Privacy Policy
                </Link>{" "}
                for how this information is used.
              </p>
              <button type="submit" className="self-start rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
