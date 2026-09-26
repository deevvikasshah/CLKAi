export function buildWhatsAppUrl(number: string | null | undefined, message: string): string | null {
  if (!number) return null;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
