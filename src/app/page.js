import Link from "next/link";
import Image from "next/image";
import styles from "./landing.module.css";
import {
  FaLeaf,
  FaBolt,
  FaShieldAlt,
  FaHeadset,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";

// Force static generation for landing page (SSG)
export const dynamic = "force-static";
export const revalidate = false;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Repairo — Expert Device Repairs & Certified Technicians",
  description:
    "Connect with certified technicians for fast, reliable repairs on all your electronic devices. Eco-friendly solutions that extend your device's lifespan. Get started today!",
  keywords: [
    "device repair",
    "phone repair",
    "laptop repair",
    "certified technician",
    "electronic repair",
    "eco-friendly repair",
    "trusted repair service",
    "repair tracking",
  ],
  openGraph: {
    title: "Repairo — Expert Device Repairs & Certified Technicians",
    description:
      "Connect with certified technicians for fast, reliable repairs on all your electronic devices. Eco-friendly solutions that extend your device's lifespan.",
    type: "website",
    url: "/",
    siteName: "Repairo",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Repairo - Expert Device Repairs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repairo — Expert Device Repairs & Certified Technicians",
    description:
      "Connect with certified technicians for fast, reliable repairs. Eco-friendly solutions that extend your device's lifespan.",
    images: ["/images/logo.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Repairo",
    description:
      "Connect with certified technicians for fast, reliable repairs on all your electronic devices.",
    url:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://repairo.com",
    logo: "/images/logo.png",
    image: "/images/logo.png",
    priceRange: "$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "250",
    },
    serviceType: "Electronic Device Repair",
    areaServed: "Worldwide",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Repair Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Phone Repair",
            description:
              "Professional smartphone and mobile device repair services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Laptop Repair",
            description: "Expert laptop and computer repair services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Electronic Device Repair",
            description:
              "Comprehensive electronic device repair and maintenance",
          },
        },
      ],
    },
  };

  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Trusted Technicians",
      desc: "Verified professionals for peace of mind.",
    },
    {
      icon: <FaBolt />,
      title: "Fast Turnaround",
      desc: "Quick diagnostics and efficient repairs.",
    },
    {
      icon: <FaLeaf />,
      title: "Eco-Friendly",
      desc: "Repair over replace to reduce waste.",
    },
    {
      icon: <FaHeadset />,
      title: "Expert Support",
      desc: "Get help at every step of your repair.",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Status Tracking",
      desc: "Track your repair status in real time.",
    },
    {
      icon: <FaStar />,
      title: "Quality Guarantee",
      desc: "Service you can trust and rate.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.page}>
        {/* Navbar */}
        <header className={styles.navbar}>
          <div className={`container ${styles.navInner}`}>
            <Link href="/landing" className={styles.brand}>
              <Image
                className={styles.logoImg}
                src="/images/logo.png"
                alt="Repairo logo"
                width={40}
                height={40}
                priority
              />
              <span className={styles.brandText}>Repairo</span>
            </Link>
            <div className={styles.navActions}>
              <Link href="/login" className={styles.btnGhost}>
                Login
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section id="home" className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <h1>
                <span>Expert Device Repairs,</span>
                <span>Delivered with Trust</span>
              </h1>
              <p>
                Connect with certified technicians for fast, reliable repairs on
                all your electronic devices. Eco-friendly solutions that extend
                your device&apos;s lifespan.
              </p>
              <Link href="/dashboard" className={styles.heroCta}>
                Get Started <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className={styles.about}>
          <div className="container">
            <h2>Why Choose Repairo?</h2>
            <div className={styles.cardsGrid}>
              {features.map((f, idx) => (
                <div key={idx} className={styles.card}>
                  <div className={styles.cardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={`container ${styles.footerInner}`}>
            <div>
              <h3>Ready to repair smarter?</h3>
              <p>Join Repairo and connect with trusted technicians now.</p>
            </div>
            <Link href="/login" className={styles.footerCta}>
              Create Account <FaArrowRight />
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
