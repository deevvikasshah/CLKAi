export function EmptyResults() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-ink-100 bg-ink-50 px-6 py-16 text-center">
      <p className="text-base font-semibold text-ink-900">No products match these filters</p>
      <p className="text-sm text-ink-500">Try widening your price range or clearing a filter.</p>
    </div>
  );
}
