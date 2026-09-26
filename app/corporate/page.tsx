import { submitCorporateEnquiry } from "@/app/actions/publicEnquiries";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = { title: "Corporate / Bulk Enquiry" };

const productCategories = ["Laptops", "Smartphones", "Tablets", "Accessories and peripherals", "Networking", "Mixed / other"];

export default function CorporatePage({ searchParams }: { searchParams: { submitted?: string } }) {
  if (searchParams.submitted === "1") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Enquiry received</h1>
        <p className="mt-2 text-sm text-ink-700">
          Thank you. A member of the CLKAi team will get in touch regarding your requirement.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Corporate / Bulk Enquiry</h1>
      <p className="mt-2 text-sm text-ink-700">
        For businesses, institutions, schools, colleges and offices needing bulk technology purchases,
        deployment support, or ongoing support/AMC packages.
      </p>

      <form action={submitCorporateEnquiry} className="mt-8 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Organisation name" name="organisationName" required />
          <TextField label="Contact person" name="contactPerson" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Work email" name="workEmail" type="email" required />
          <TextField label="Phone number" name="phone" required inputMode="numeric" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="City" name="city" required />
          <TextField label="GSTIN (optional)" name="gstin" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="productCategory" className="text-sm font-medium text-ink-700">
            Product category
          </label>
          <select id="productCategory" name="productCategory" required className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring">
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <TextField label="Preferred brands (optional)" name="preferredBrands" />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Approximate quantity (optional)" name="approxQuantity" />
          <TextField label="Budget range (optional)" name="budgetRange" />
        </div>

        <TextField label="Required delivery date (optional)" name="requiredDeliveryDate" type="date" />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="requirementDescription" className="text-sm font-medium text-ink-700">
            Requirement description
          </label>
          <textarea id="requirementDescription" name="requirementDescription" required rows={4} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" />
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-700">
          <input type="checkbox" name="consentFollowUp" className="mt-0.5" />
          I agree that CLKAi may contact me regarding this enquiry. This is optional and separate from follow-up
          needed to process the enquiry itself.
        </label>

        <p className="text-xs text-ink-500">
          See our{" "}
          <a href="/policies/privacy" className="underline hover:text-brand-600">
            Privacy Policy
          </a>{" "}
          for how this information is used.
        </p>

        <button type="submit" className="self-start rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 focus-ring">
          Submit enquiry
        </button>
      </form>

      {siteConfig.contact.email && (
        <p className="mt-6 text-sm text-ink-500">
          You can also reach us directly at {siteConfig.contact.email}.
        </p>
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
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink-700">
        {label}
      </label>
      <input id={name} name={name} type={type} required={required} className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring" {...rest} />
    </div>
  );
}
