import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <TrendingUp className="h-16 w-16 text-[#059669]" />
        <h1 className="text-4xl font-bold tracking-tight text-[#059669]">
          DClaw Finance
        </h1>
        <p className="text-lg text-gray-600">
          Financial modeling &amp; risk analysis
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-[#059669] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
