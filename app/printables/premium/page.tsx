import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ChevronLeft, Crown, Download, FileCheck2, Printer, ShieldCheck, Sparkles } from "lucide-react";
import PayPalCheckout from "@/components/printables/PayPalCheckout";
import { formatPrintablePrice } from "@/data/printables";
import { getPrintableCatalog } from "@/lib/db/printables";
import premium from "@/components/premium/PremiumExperience.module.css";
import styles from "./PrintablesPremium.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "SpotDiffs Premium Printable PDF Access",
  description: "Unlock all current and new Premium spot the difference printable PDFs for 31 days with one PayPal purchase.",
  alternates: { canonical: "https://spotdiffs.com/printables/premium" },
};

export default async function PremiumPrintablesPage() {
  const { premiumPlan, products } = await getPrintableCatalog();
  const includedProducts = products.filter(product => product.isPremiumIncluded);
  const price = formatPrintablePrice(premiumPlan);
  const benefits = [
    { icon: Printer, title: "Every Premium", detail: "printable pack" },
    { icon: FileCheck2, title: "Complete", detail: "answer keys" },
    { icon: CalendarDays, title: `${premiumPlan.accessDays} days`, detail: "of access" },
    { icon: Sparkles, title: "New releases", detail: "during your pass" },
  ];
  const faqs = [
    ["What does the printable pass include?", `Every current Premium-included printable pack, plus new Premium-included releases published during your ${premiumPlan.accessDays}-day access period. Each pack includes puzzles and complete answer keys.`],
    ["Is this a recurring subscription?", `No. Pay ${price} once for ${premiumPlan.accessDays} days of access. Your pass starts when PayPal confirms payment and does not renew automatically.`],
    ["Is there a monthly pack limit?", "This PDF-only pass unlocks every Premium-included pack during its access period. The separate game Premium membership includes 10 printable pack credits each month; those credits are a different benefit."],
    ["How do I get my files?", "After payment, open any included pack and download its PDFs. Access is saved in this browser; signed-in purchases are also linked to your account. Keep your PayPal order ID for support."],
    ["Where can I use the printables?", "Use your downloads in one household or one classroom. Print at home or at school for screen-free puzzle time. No physical items are shipped."],
    ["Does this include Premium online games?", "Online game membership is sold separately. The printable pass gives you PDF access; it does not include Premium online puzzles or site-wide ad-free browsing."],
  ];

  return (
    <div className={premium.page}>
      <div className={styles.breadcrumb}><Link href="/printables"><ChevronLeft aria-hidden="true" /> All printables</Link></div>
      <section className={`${premium.hero} ${styles.hero}`}>
        <div className={premium.introduction}>
          <span className={premium.eyebrow}><Crown aria-hidden="true" /> Premium Printable Pass</span>
          <h1 className={premium.headline}>One pass.<br /><span className={premium.headlineAccent}>More discoveries.</span></h1>
          <p className={premium.description}>Unlock every Premium printable, enjoy screen-free puzzle time, and discover new packs throughout your {premiumPlan.accessDays}-day pass.</p>
          <div className={premium.benefits}>
            {benefits.map(({ icon: Icon, title, detail }) => <div key={title} className={premium.benefit}><span className={premium.benefitIcon}><Icon aria-hidden="true" /></span><p>{title}<br />{detail}</p></div>)}
          </div>
          <p className={styles.audience}>A little more fun for home, family, and classroom.</p>
        </div>
        <aside className={premium.planCard} aria-labelledby="printable-pass-heading">
          <h2 id="printable-pass-heading" className={premium.cardHeading}>Your printable pass</h2>
          <div className={styles.pricePanel}>
            <span className={styles.passBadge}><Crown aria-hidden="true" /> Full PDF access</span>
            <p className={styles.price}>{price}<span>/ {premiumPlan.accessDays} days</span></p>
            <p className={styles.paymentNote}>One payment. No auto-renewal.</p>
          </div>
          <ul className={styles.features}>{premiumPlan.features.map(feature => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}</ul>
          <div className={styles.checkout}>
            <PayPalCheckout purchaseType="premium" itemSlug={premiumPlan.slug} priceLabel={price} accessDays={premiumPlan.accessDays} minimal />
          </div>
          <p className={styles.totalLabel}>Your total, paid once</p>
          <p className={styles.total}>{price}<span>USD</span></p>
          <div className={premium.reassurance}>
            <span><ShieldCheck aria-hidden="true" /> PayPal checkout</span>
            <span><Download aria-hidden="true" /> Digital PDFs</span>
            <span><CalendarDays aria-hidden="true" /> No renewal</span>
          </div>
          <p className={styles.policy}>Access starts after payment confirmation. Digital purchases are subject to our <Link href="/refund-policy" className={premium.textLink}>refund policy</Link>.</p>
        </aside>
      </section>

      <section className={styles.howSection}>
        <div className={premium.sectionHeading}><span className={premium.kicker}>Less setup. More discovery.</span><h2>Your next puzzle break, on paper.</h2><p>Three simple steps from a little curiosity to a little quiet time.</p></div>
        <ol className={styles.steps}>
          {[
            { icon: Crown, title: "Get your pass", text: `Pay once for ${premiumPlan.accessDays} days of access to every Premium-included printable.` },
            { icon: Download, title: "Find your favorites", text: "Browse the included collection and download the PDF files you want to play." },
            { icon: Printer, title: "Print, play, and check", text: "Print your puzzles, spot the differences, and check the complete answer keys." },
          ].map(({ icon: Icon, title, text }, index) => <li key={title}><span className={styles.stepNumber}>0{index + 1}</span><span className={premium.benefitIcon}><Icon aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></li>)}
        </ol>
      </section>

      <section className={styles.collection} aria-labelledby="included-packs-heading">
        <div className={premium.sectionHeading}><span className={premium.kicker}>Included in your pass</span><h2 id="included-packs-heading">Print. Unplug. Play.</h2><p>Pick a pack for your next screen-free moment. Every pack below includes puzzles and answer keys.</p><span className={styles.packCount}><FileCheck2 aria-hidden="true" />{includedProducts.length} printable {includedProducts.length === 1 ? "pack" : "packs"} included</span></div>
        {includedProducts.length > 0 ? <div className={styles.packGrid}>{includedProducts.map(product => <Link key={product.id} href={`/printables/${product.slug}`} className={styles.packCard} aria-label={`View ${product.title}`}>
          <div className={styles.packImage}><Image src={product.previewImage} alt={`Preview of ${product.title}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" className="object-cover object-top" /><span className={styles.included}><Crown aria-hidden="true" /> Included in your pass</span></div>
          <div className={styles.packCopy}><h3>{product.title}</h3><p>{product.puzzleCount} puzzles <span>·</span> {product.totalPages} pages <span>·</span> Answer keys</p><span className={styles.viewPack}>Explore this pack <ArrowRight aria-hidden="true" /></span></div>
        </Link>)}</div> : <p className={styles.empty}>New printable packs are on their way. <Link href="/printables" className={premium.textLink}>Browse all printables</Link></p>}
      </section>

      <section className={premium.faqSection}>
        <div className={premium.sectionHeading}><span className={premium.kicker}>Before you print</span><h2>A few things to know</h2></div>
        <div className={premium.faqs}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        <div className={styles.gameMembership}><Crown aria-hidden="true" /><div><h3>Prefer to play online, too?</h3><p>Game Premium includes all Premium online puzzles, ad-free browsing, and 10 printable packs each month.</p><Link href="/premium?source=printable-pass" className={premium.textLink}>Explore game Premium <ArrowRight aria-hidden="true" /></Link></div></div>
      </section>
    </div>
  );
}
