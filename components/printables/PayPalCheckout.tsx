"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import PrintableFileLinks from "@/components/printables/PrintableFileLinks";
import type { PrintableProductFile } from "@/data/printables";

type PayPalConfig = {
  enabled: boolean;
  clientId: string;
  currency: string;
  mode: "sandbox" | "live";
};

type Receipt = {
  orderId: string;
  downloadToken: string;
  expiresAt: string;
  accessType: "product" | "premium";
};

type PayPalButtonsInstance = {
  close?: () => Promise<void>;
  render: (container: HTMLElement) => Promise<void>;
};

type PayPalButtonsOptions = {
  style: {
    color: string;
    label: string;
    layout: string;
    shape: string;
  };
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onCancel: () => void;
  onError: () => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance;
    };
  }
}

function storageKey(
  purchaseType: "product" | "premium",
  itemSlug: string,
) {
  return purchaseType === "premium"
    ? "spotdiffs:premium-access"
    : `spotdiffs:printable-access:${itemSlug}`;
}

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
  };
  return body.error || fallback;
}

export default function PayPalCheckout({
  purchaseType = "product",
  itemSlug,
  priceLabel,
  accessDays,
  downloadFiles = [],
  embedded = false,
}: {
  purchaseType?: "product" | "premium";
  itemSlug: string;
  priceLabel: string;
  accessDays?: number;
  downloadFiles?: PrintableProductFile[];
  embedded?: boolean;
}) {
  const buttonsContainer = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "processing" | "complete" | "unavailable"
  >("loading");
  const [error, setError] = useState("");
  const [checkoutExpanded, setCheckoutExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const saved = window.localStorage.getItem(
      storageKey(purchaseType, itemSlug),
    );
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Receipt;
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          queueMicrotask(() => {
            if (!cancelled) {
              setReceipt(parsed);
              setStatus("complete");
            }
          });
          return () => {
            cancelled = true;
          };
        }
        window.localStorage.removeItem(storageKey(purchaseType, itemSlug));
      } catch {
        window.localStorage.removeItem(storageKey(purchaseType, itemSlug));
      }
    }

    fetch("/api/paypal/config", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load checkout.");
        }
        return (await response.json()) as PayPalConfig;
      })
      .then((paypalConfig) => {
        if (!cancelled) {
          setConfig(paypalConfig);
          setStatus(paypalConfig.enabled ? "ready" : "unavailable");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("PayPal checkout is temporarily unavailable.");
          setStatus("unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [itemSlug, purchaseType]);

  useEffect(() => {
    const paypalConfig = config;
    if (
      !paypalConfig?.enabled ||
      !buttonsContainer.current ||
      (embedded && !checkoutExpanded)
    ) {
      return;
    }
    const { clientId, currency } = paypalConfig;

    let cancelled = false;
    let buttons: PayPalButtonsInstance | undefined;
    const container = buttonsContainer.current;

    async function loadPayPal() {
      const scriptId = "spotdiffs-paypal-sdk";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!window.paypal) {
        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
            clientId,
          )}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
          script.async = true;
          document.head.appendChild(script);
        }

        await new Promise<void>((resolve, reject) => {
          if (window.paypal) {
            resolve();
            return;
          }
          script?.addEventListener("load", () => resolve(), { once: true });
          script?.addEventListener(
            "error",
            () => reject(new Error("PayPal SDK failed to load.")),
            { once: true },
          );
        });
      }

      if (cancelled || !window.paypal || !container) {
        return;
      }

      container.replaceChildren();
      buttons = window.paypal.Buttons({
        style: {
          color: "gold",
          label: "paypal",
          layout: "vertical",
          shape: "rect",
        },
        createOrder: async () => {
          setError("");
          const response = await fetch("/api/paypal/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purchaseType, itemSlug }),
          });
          if (!response.ok) {
            throw new Error(
              await readError(response, "Unable to create your order."),
            );
          }
          const order = (await response.json()) as { id: string };
          return order.id;
        },
        onApprove: async ({ orderID }) => {
          setStatus("processing");
          setError("");
          const response = await fetch(
            `/api/paypal/orders/${encodeURIComponent(orderID)}/capture`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ purchaseType, itemSlug }),
            },
          );
          if (!response.ok) {
            const message = await readError(
              response,
              "Payment completed, but the download could not be prepared.",
            );
            setError(`${message} Contact support with order ${orderID}.`);
            setStatus("ready");
            return;
          }

          const completedReceipt = (await response.json()) as Receipt;
          window.localStorage.setItem(
            storageKey(purchaseType, itemSlug),
            JSON.stringify(completedReceipt),
          );
          setReceipt(completedReceipt);
          setStatus("complete");
        },
        onCancel: () => {
          setError("Checkout was canceled. You have not been charged.");
        },
        onError: () => {
          setError("PayPal could not complete checkout. Please try again.");
        },
      });
      await buttons.render(container);
    }

    loadPayPal().catch(() => {
      setError("PayPal checkout could not be loaded. Please try again later.");
      setStatus("unavailable");
    });

    return () => {
      cancelled = true;
      void buttons?.close?.();
    };
  }, [checkoutExpanded, config, embedded, itemSlug, purchaseType]);

  if (status === "complete" && receipt) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30"
        role="status"
      >
        <div className="mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          <h3 className="text-lg font-bold">
            {purchaseType === "premium"
              ? "Premium access active"
              : "Payment complete"}
          </h3>
        </div>
        <p className="mb-5 text-sm leading-6 text-emerald-900/80 dark:text-emerald-200/80">
          {purchaseType === "premium"
            ? `Every Premium-included printable is unlocked in this browser${
                accessDays ? ` for ${accessDays} days` : ""
              }. `
            : "Your secure download is ready. "}
          Save your PayPal order ID{" "}
          <strong>{receipt.orderId}</strong> for support.
        </p>
        {purchaseType === "product" ? (
          <PrintableFileLinks
            productSlug={itemSlug}
            files={downloadFiles}
            token={receipt.downloadToken}
            tone="emerald"
          />
        ) : (
          <Link
            href="/printables"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Browse Premium printables
          </Link>
        )}
        <p className="mt-3 text-xs text-emerald-800/70 dark:text-emerald-300/70">
          Access remains available in this browser until{" "}
          {new Date(receipt.expiresAt).toLocaleDateString("en-US", {
            dateStyle: "medium",
          })}
          .
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        purchaseType === "premium"
          ? "rounded-[1.4rem] border border-white/90 bg-white p-6 shadow-[0_16px_45px_rgba(249,115,22,0.12)] dark:border-slate-700 dark:bg-slate-900"
          : embedded
            ? ""
            : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      }
    >
      {!embedded && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {purchaseType === "premium"
                ? "Pay once with PayPal"
                : "One-time payment"}
            </p>
            {purchaseType === "premium" ? (
              <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">
                Unlock Premium access
              </p>
            ) : (
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {priceLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <LockKeyhole className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Secure checkout
          </div>
        </div>
      )}

      {embedded && status === "ready" && !checkoutExpanded && (
        <button
          type="button"
          onClick={() => setCheckoutExpanded(true)}
          className="flex min-h-[4.6rem] w-full cursor-pointer items-center justify-center gap-3 rounded-[1.15rem] bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 text-lg font-black text-white shadow-lg shadow-orange-200/60 transition hover:from-orange-600 hover:to-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:shadow-none"
        >
          Get the Printable Pack — {priceLabel}
          <Download className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {status === "loading" && (
        <div className="h-[4.6rem] animate-pulse rounded-[1.15rem] bg-slate-100 dark:bg-slate-800" />
      )}
      {status === "processing" && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          Confirming your payment and preparing the secure download...
        </div>
      )}
      {status === "unavailable" && (
        <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          PayPal checkout is not active yet. Add the PayPal and Supabase
          server credentials before accepting a payment.
        </div>
      )}
      <div
        ref={buttonsContainer}
        className={
          status === "ready" && (!embedded || checkoutExpanded)
            ? "min-h-12"
            : "hidden"
        }
      />

      {error && (
        <p
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {embedded ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">
          <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
          Secure checkout · Download immediately after payment
        </p>
      ) : (
        <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {purchaseType === "premium"
            ? "This is a one-time purchase, not an auto-renewing subscription. Access starts when PayPal confirms payment."
            : "You will receive an instant digital download after PayPal confirms payment. No physical item will be shipped."}
        </p>
      )}
    </div>
  );
}
