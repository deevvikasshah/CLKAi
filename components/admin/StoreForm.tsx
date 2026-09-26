import { availableServiceOptions } from "@/lib/storeValidation";

interface StoreFormProps {
  action: (formData: FormData) => void;
  store?: {
    id: string;
    storeName: string;
    storeCode: string;
    addressLine1: string;
    addressLine2: string | null;
    locality: string | null;
    city: string;
    state: string;
    pincode: string;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    mapUrl: string | null;
    storeManagerName: string | null;
    pickupAvailable: boolean;
    repairAvailable: boolean;
    corporateSupportAvailable: boolean;
    operationalState: string;
    servicesJson: string | null;
  };
  restrictedToOperationalFields?: boolean;
}

const serviceLabel: Record<string, string> = {
  sales: "Sales",
  laptop_repair: "Laptop repair",
  smartphone_repair: "Smartphone repair",
  tablet_repair: "Tablet repair",
  pickup_drop: "Pickup and drop",
  corporate_support: "Corporate support",
  store_pickup: "Store pickup",
};

export function StoreForm({ action, store, restrictedToOperationalFields = false }: StoreFormProps) {
  const services: string[] = store?.servicesJson ? JSON.parse(store.servicesJson) : [];

  return (
    <form action={action} className="flex flex-col gap-5">
      {store && <input type="hidden" name="storeId" value={store.id} />}

      {!restrictedToOperationalFields && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Store name" name="storeName" defaultValue={store?.storeName} required />
            <TextField label="Store code" name="storeCode" defaultValue={store?.storeCode} required />
          </div>

          <TextField label="Address line 1" name="addressLine1" defaultValue={store?.addressLine1} required />
          <TextField label="Address line 2 (optional)" name="addressLine2" defaultValue={store?.addressLine2 ?? ""} />
          <TextField label="Locality (optional)" name="locality" defaultValue={store?.locality ?? ""} />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="City" name="city" defaultValue={store?.city} required />
            <TextField label="State" name="state" defaultValue={store?.state ?? "Maharashtra"} required />
            <TextField label="Pincode" name="pincode" defaultValue={store?.pincode} required inputMode="numeric" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Latitude (optional)" name="latitude" defaultValue={store?.latitude ?? ""} />
            <TextField label="Longitude (optional)" name="longitude" defaultValue={store?.longitude ?? ""} />
          </div>

          <TextField label="Map URL (optional)" name="mapUrl" defaultValue={store?.mapUrl ?? ""} type="url" />
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Phone (optional)" name="phone" defaultValue={store?.phone ?? ""} />
        <TextField label="WhatsApp number (optional)" name="whatsapp" defaultValue={store?.whatsapp ?? ""} />
      </div>
      <TextField label="Email (optional)" name="email" type="email" defaultValue={store?.email ?? ""} />
      <TextField label="Store manager name (optional)" name="storeManagerName" defaultValue={store?.storeManagerName ?? ""} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="operationalState" className="text-sm font-medium text-ink-700">
          Operational state
        </label>
        <select
          id="operationalState"
          name="operationalState"
          defaultValue={store?.operationalState ?? "coming_soon"}
          className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring sm:max-w-xs"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="temporarily_closed">Temporarily Closed</option>
          <option value="coming_soon">Coming Soon</option>
        </select>
      </div>

      <fieldset className="flex flex-wrap gap-3">
        <legend className="mb-1 text-sm font-medium text-ink-700">Services offered</legend>
        {availableServiceOptions.map((s) => (
          <label key={s} className="flex items-center gap-1.5 text-sm text-ink-700">
            <input type="checkbox" name="services" value={s} defaultChecked={services.includes(s)} />
            {serviceLabel[s] ?? s}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-wrap gap-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-700">
          <input type="checkbox" name="pickupAvailable" defaultChecked={store?.pickupAvailable} />
          Store pickup available
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-700">
          <input type="checkbox" name="repairAvailable" defaultChecked={store?.repairAvailable} />
          Repair booking available
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-700">
          <input type="checkbox" name="corporateSupportAvailable" defaultChecked={store?.corporateSupportAvailable} />
          Corporate support available
        </label>
      </fieldset>

      <button
        type="submit"
        className="mt-2 self-start rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 focus-ring"
      >
        {store ? "Save changes" : "Create store (as Draft)"}
      </button>
    </form>
  );
}

function TextField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
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
        defaultValue={defaultValue ?? ""}
        className="rounded-lg border border-ink-300 px-3 py-2.5 text-sm focus-ring"
        {...rest}
      />
    </div>
  );
}
