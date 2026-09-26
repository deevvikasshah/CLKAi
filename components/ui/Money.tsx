export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Money({ amount, className }: { amount: number; className?: string }) {
  return <span className={className}>{formatInr(amount)}</span>;
}
