import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="grain" aria-hidden />
      <div className="max-w-md text-center">
        <h1 className="serif text-7xl font-semibold text-paper">404</h1>
        <p className="mt-4 text-muted-dark">This page slipped off the staff.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-[color:var(--teal)] px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-[color:var(--ink)]"
        >
          Back to Analyze
        </Link>
      </div>
    </div>
  );
}
