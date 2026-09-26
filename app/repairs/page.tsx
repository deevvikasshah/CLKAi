import { prisma } from "@/lib/prisma";
import { bookRepair } from "@/app/actions/repairs";
import { deviceTypes, issueTypes, serviceModes, repairTerms } from "@/lib/repairConstants";
import { repairWarrantyFallback } from "@/lib/siteConfig";

export const metadata = { title: "Repairs & Services" };

// The store dropdown must reflect admin publish/unpublish changes without a
// rebuild — this page has no dynamic input (no searchParams, no cookies)
// so Next would otherwise cache it fully static at build time.
export const revalidate = 30;

export default async function RepairsPage() {
  const stores = await prisma.store.findMany({
    where: { status: "published", repairAvailable: true },
    orderBy: { city: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Need a Repair?</h1>
      <p className="mt-2 text-sm text-ink-700">
        Get in touch with your nearest CLKAi store regarding your device repair requirement.
        Fill in the details below to raise a repair request and receive a reference number.
      </p>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>{repairTerms.backupNotice}</p>
        <p className="mt-2">{repairTerms.dataRecoveryDisclaimer}</p>
        <p className="mt-2">{repairTerms.diagnosticFeeNotice}</p>
        <p className="mt-2">{repairWarrantyFallback}</p>
      </div>

      {stores.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500">
          No CLKAi store currently accepts repair bookings online. Please use the{" "}
          <a href="/contact" className="underline hover:text-brand-600">
            Contact
          </a>{" "}
          page to reach us.
        </p>
      ) : (
      <form action={bookRepair} className="mt-8 flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-ink-900">1. Device type</legend>
          <div className="flex flex-wrap gap-3">
            {deviceTypes.map((d, i) => (
              <label key={d.value} className="flex items-center gap-1.5 text-sm text-ink-700">
                <input type="radio" name="deviceType" value={d.value} required defaultChecked={i === 0} />
                {d.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Brand (optional)" name="brand" />
          <TextField label="Model (optional)" name="model" />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-ink-900">2. Issue type</legend>
          <select name="issueType" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring sm:max-w-xs">
            {issueTypes.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="issueDescription" className="text-sm font-semibold text-ink-900">
            3. Describe the issue (optional)
          </label>
          <textarea
            id="issueDescription"
            name="issueDescription"
            rows={3}
            maxLength={2000}
            className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-ink-900">4. Preferred store</legend>
          <select name="storeId" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring sm:max-w-sm">
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.storeName} — {s.city}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-ink-900">5. How would you like to proceed?</legend>
          <div className="flex flex-col gap-2">
            {serviceModes.map((s, i) => (
              <label key={s.value} className="flex items-center gap-2 text-sm text-ink-700">
                <input type="radio" name="serviceMode" value={s.value} required defaultChecked={i === 0} />
                {s.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-500">
            Pickup and drop is available only at stores that offer it — you&rsquo;ll be notified if it isn&rsquo;t available
            at your selected store.
          </p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Your name" name="customerName" required />
          <TextField label="Phone number" name="customerPhone" required inputMode="numeric" placeholder="10-digit mobile number" />
        </div>
        <TextField label="Email (optional)" name="customerEmail" type="email" />

        <label className="flex items-start gap-2 text-sm text-ink-700">
          <input type="checkbox" name="consentDataDiagnostics" required className="mt-0.5" />
          I understand CLKAi may need to access my device for diagnosis and/or repair, and I consent to this. I have
          backed up (or accept the risk of not backing up) my data.
        </label>

        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
        >
          Submit Repair Request
        </button>
      </form>
      )}
    </div>
  );
}

function TextField({
  label,
  name,
  type = "text",
  required = false,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
        {...rest}
      />
    </div>
  );
}
