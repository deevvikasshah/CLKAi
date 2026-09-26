import { siteConfig } from "@/lib/siteConfig";

export const metadata = { title: "Security / Responsible Disclosure" };

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Security / Responsible Disclosure</h1>

      <div className="mt-6 flex flex-col gap-4 text-sm text-ink-700">
        <p>
          CLKAi takes the security of this website and its customers seriously. We use layered security
          controls, keep dependencies patched, and review changes to security-sensitive areas of the
          site. No system is unhackable — we rely on ongoing patching, monitoring, backup testing and
          periodic independent security testing rather than any single guarantee.
        </p>

        <p>
          If you believe you have found a security vulnerability on this website, please report it
          responsibly rather than exploiting it or disclosing it publicly before we&rsquo;ve had a chance to
          address it.
        </p>

        {siteConfig.security.disclosureEmail ? (
          <p>
            Report security issues to{" "}
            <a href={`mailto:${siteConfig.security.disclosureEmail}`} className="text-brand-600 hover:text-brand-500">
              {siteConfig.security.disclosureEmail}
            </a>
            .
          </p>
        ) : (
          <p className="text-ink-500">
            A dedicated security contact email will be published here once CLKAi designates one. In the
            meantime, use the{" "}
            <a href="/contact" className="text-brand-600 hover:text-brand-500">
              Contact
            </a>{" "}
            page and mark your message as a security report.
          </p>
        )}

        <p>Please include as much detail as possible: steps to reproduce, affected URL, and impact.</p>
      </div>
    </div>
  );
}
