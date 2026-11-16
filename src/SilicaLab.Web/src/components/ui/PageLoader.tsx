export default function PageLoader() {
  return (
    <div role="status" className="flex justify-center py-20">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
