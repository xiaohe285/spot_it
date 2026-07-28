import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = "https://spotdiffs.com";

export const metadata: Metadata = {
  title: "Digital Delivery & Refund Policy",
  description:
    "Learn how SpotDiffs printable PDF orders are delivered, how to get download support, and when refunds are available.",
  alternates: {
    canonical: `${siteUrl}/refund-policy`,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-12">
        <h1 className="text-4xl font-black text-slate-950 dark:text-white">
          Digital Delivery & Refund Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Last updated: July 25, 2026
        </p>

        <div className="mt-10 space-y-9 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Digital product delivery
            </h2>
            <p className="mt-3 leading-7">
              Printable products are PDF digital downloads. No physical item is
              shipped. Free files are available immediately. For paid products,
              the download button appears on the product page only after PayPal
              confirms a completed payment.
            </p>
            <p className="mt-3 leading-7">
              A paid download link remains stored in the purchasing browser for
              30 days. Keep your PayPal order ID. If you change devices, clear
              browser storage, or cannot access the file, email{" "}
              <a
                href="mailto:support@spotdiffs.com"
                className="font-semibold text-orange-600 underline"
              >
                support@spotdiffs.com
              </a>{" "}
              with that order ID so we can verify the purchase and restore
              access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Refund eligibility
            </h2>
            <p className="mt-3 leading-7">
              Because a PDF cannot be returned after delivery, completed digital
              downloads are normally non-refundable once the file has been
              accessed. We will review and, when appropriate, refund duplicate
              charges, a file that is materially different from its product
              description, or a file that remains unusable after we have had a
              reasonable opportunity to replace it.
            </p>
            <p className="mt-3 leading-7">
              Nothing in this policy limits any non-waivable consumer rights
              provided by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Requesting help or a refund
            </h2>
            <p className="mt-3 leading-7">
              Contact us within 14 days of purchase and include your PayPal order
              ID, the product name, and a short description of the problem.
              Please do not email payment-card details. We usually respond
              within 48 hours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              License
            </h2>
            <p className="mt-3 leading-7">
              A download may be printed for one household or one classroom.
              Reselling, sharing the source PDF, uploading it to another
              service, or including it in another commercial product is not
              permitted.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/printables"
            className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700"
          >
            Browse printables
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Contact support
          </Link>
        </div>
      </article>
    </div>
  );
}
