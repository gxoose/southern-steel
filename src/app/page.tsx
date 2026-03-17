"use client";

import { useState, useRef, useEffect } from "react";

/* ─── DATA ─── */
const BEATS = [
  {
    id: 1,
    title: "MIDNIGHT DRIP",
    bpm: 140,
    key: "Cm",
    tags: ["Dark Trap", "808", "Ambient"],
    price: 29.99,
    exclusive: 299,
    accent: "#8b5cf6",
    duration: "3:24",
  },
  {
    id: 2,
    title: "PHANTOM BOUNCE",
    bpm: 145,
    key: "Gm",
    tags: ["Trap", "Bouncy", "Hard"],
    price: 34.99,
    exclusive: 349,
    accent: "#f43f5e",
    duration: "2:58",
  },
  {
    id: 3,
    title: "VOID WALKER",
    bpm: 130,
    key: "D#m",
    tags: ["Dark", "Melodic", "808"],
    price: 24.99,
    exclusive: 249,
    accent: "#d4a024",
    duration: "3:42",
  },
  {
    id: 4,
    title: "NEON GRAVITAS",
    bpm: 155,
    key: "Am",
    tags: ["Aggressive", "Trap", "Drill"],
    price: 39.99,
    exclusive: 399,
    accent: "#10b981",
    duration: "3:11",
  },
  {
    id: 5,
    title: "SMOKE SIGNAL",
    bpm: 135,
    key: "Fm",
    tags: ["Lo-fi", "Trap", "Moody"],
    price: 29.99,
    exclusive: 299,
    accent: "#6366f1",
    duration: "3:36",
  },
  {
    id: 6,
    title: "BLACK AURORA",
    bpm: 150,
    key: "Bbm",
    tags: ["Dark Trap", "Cinematic", "808"],
    price: 44.99,
    exclusive: 449,
    accent: "#ec4899",
    duration: "4:02",
  },
];

const FAQ = [
  {
    q: "What license types do you offer?",
    a: "We offer MP3 Lease ($29.99), WAV Lease ($49.99), Trackout ($99.99), and Exclusive rights (varies per beat). Each tier grants different distribution limits and usage rights.",
  },
  {
    q: "Can I use these beats for commercial releases?",
    a: "Absolutely. All leases include commercial rights. MP3 leases cover up to 5,000 streams, WAV up to 50,000, and Trackouts unlimited non-exclusive. Exclusive purchases grant full ownership.",
  },
  {
    q: "Do you offer custom production?",
    a: "Yes. Custom beats start at $500. We work with you on reference tracks, mood, BPM, and key to craft something tailored to your vision. Turnaround is typically 3-5 business days.",
  },
  {
    q: "What formats are included?",
    a: "MP3 leases include tagged 320kbps MP3. WAV leases add untagged WAV. Trackout packages include individual stems in WAV format. Exclusives include all formats plus the project file.",
  },
  {
    q: "How does the exclusive process work?",
    a: "Once you purchase exclusive rights, the beat is permanently removed from the store. You receive all files within 24 hours, and the beat becomes yours — no other artist can license it.",
  },
  {
    q: "Do you offer discounts for bulk purchases?",
    a: "Yes. Buy 3+ beats and get 15% off. Buy 5+ and get 25% off. Reach out directly for custom bundle pricing on exclusive packages.",
  },
];

const MARQUEE_WORDS = [
  "808s",
  "DARK TRAP",
  "HEAVY BASS",
  "EXCLUSIVE",
  "PREMIUM",
  "HI-HATS",
  "MELODIC",
  "HARD HITTING",
  "CINEMATIC",
  "DRILL",
];

/* ─── COMPONENTS ─── */

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-display text-xl font-bold tracking-tight">
          808 <span className="text-purple">GXOOSE</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-sec">
          <a href="#beats" className="hover:text-text transition-colors">
            Beats
          </a>
          <a href="#catalog" className="hover:text-text transition-colors">
            Catalog
          </a>
          <a href="#about" className="hover:text-text transition-colors">
            About
          </a>
          <a href="#contact" className="hover:text-text transition-colors">
            Contact
          </a>
        </div>
        <div className="hidden md:block">
          <a href="#catalog" className="btn-primary text-sm">
            Browse Beats
          </a>
        </div>
        <button
          className="md:hidden text-text-sec hover:text-text"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-bg/95 backdrop-blur-xl border-b border-border px-6 py-8 space-y-6">
          {["beats", "catalog", "about", "contact"].map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className="block text-2xl font-display font-bold uppercase tracking-wider text-text-sec hover:text-text transition-colors"
              onClick={() => setOpen(false)}
            >
              {s}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function SectionNumber({ n }: { n: string }) {
  return (
    <div className="section-number" aria-hidden="true">
      {n}
    </div>
  );
}

function Marquee() {
  const doubled = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="overflow-hidden py-6 border-y border-border">
      <div className="marquee-track flex whitespace-nowrap">
        {doubled.map((word, i) => (
          <span
            key={i}
            className="mx-8 text-xl md:text-2xl font-display font-bold uppercase tracking-widest text-text-dim"
          >
            {word}
            <span className="ml-8 text-purple/40">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const WAVEFORM_HEIGHTS = Array.from({ length: 40 }, (_, i) =>
  20 + seededRandom(i) * 80
);

function WaveformVisualizer() {
  return (
    <div className="flex items-end gap-[3px] h-16" aria-hidden="true">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="waveform-bar w-[3px] bg-purple/60 rounded-full"
          style={{
            animationDelay: `${i * 0.05}s`,
            height: `${h}%`,
          }}
        />
      ))}
    </div>
  );
}

const BEAT_WAVEFORM_HEIGHTS = Array.from({ length: 60 }, (_, i) =>
  15 + Math.sin(i * 0.5) * 40 + seededRandom(i + 100) * 30
);

function BeatCard({
  beat,
  isPlaying,
  onToggle,
}: {
  beat: (typeof BEATS)[0];
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="beat-card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight">
            {beat.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 font-mono text-xs text-text-sec">
            <span>{beat.bpm} BPM</span>
            <span className="text-border-light">|</span>
            <span>{beat.key}</span>
            <span className="text-border-light">|</span>
            <span>{beat.duration}</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isPlaying
              ? beat.accent
              : `${beat.accent}20`,
            color: isPlaying ? "#fff" : beat.accent,
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Fake waveform */}
      <div className="flex items-center gap-[2px] h-8 mb-4">
        {BEAT_WAVEFORM_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="w-[2px] rounded-full transition-colors"
            style={{
              height: `${h}%`,
              background: isPlaying
                ? i < 30
                  ? beat.accent
                  : `${beat.accent}30`
                : `${beat.accent}20`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {beat.tags.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-baseline gap-2">
          <span
            className="font-display text-lg font-bold"
            style={{ color: beat.accent }}
          >
            ${beat.price}
          </span>
          <span className="text-xs text-text-dim">lease</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="license-badge">${beat.exclusive} excl.</span>
        </div>
      </div>
    </div>
  );
}

function FAQItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQ)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-start gap-6 text-left group"
      >
        <span className="font-mono text-sm text-text-dim mt-1">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg md:text-xl font-bold group-hover:text-purple transition-colors">
            {item.q}
          </h3>
          {isOpen && (
            <p className="mt-4 text-text-sec leading-relaxed max-w-2xl">
              {item.a}
            </p>
          )}
        </div>
        <span className="text-text-dim text-2xl mt-0.5 transition-transform">
          {isOpen ? "−" : "+"}
        </span>
      </button>
    </div>
  );
}

/* ─── SCROLL ANIMATION HOOK ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function Home() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      {/* Noise overlay */}
      <div className="noise-overlay fixed inset-0 z-0" />

      <main className="relative z-10">
        {/* ═══ SECTION 001 — HERO ═══ */}
        <section
          id="beats"
          className="min-h-screen flex flex-col justify-center pt-16"
        >
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
            <RevealSection>
              <SectionNumber n="001" />
              <div className="mt-8 mb-6 flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full bg-purple relative"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 rounded-full bg-purple pulse-ring" />
                </div>
                <span className="font-mono text-sm text-text-dim uppercase tracking-widest">
                  Now Streaming
                </span>
              </div>
            </RevealSection>

            <RevealSection>
              <h1 className="font-display font-bold tracking-tighter leading-[0.9]">
                <span className="block text-[clamp(3rem,12vw,10rem)] text-text">
                  808
                </span>
                <span className="block text-[clamp(3rem,12vw,10rem)] glow-purple text-purple">
                  GXOOSE
                </span>
              </h1>
            </RevealSection>

            <RevealSection className="mt-10 max-w-xl">
              <p className="text-lg md:text-xl text-text-sec leading-relaxed">
                Dark trap. Heavy 808s. Exclusive instrumentals crafted for
                artists who move different. Every beat is a world — step inside.
              </p>
            </RevealSection>

            <RevealSection className="mt-10 flex flex-wrap gap-4">
              <a href="#catalog" className="btn-primary">
                Browse Catalog
              </a>
              <a href="#contact" className="btn-outline">
                Custom Beats
              </a>
            </RevealSection>

            <RevealSection className="mt-16">
              <WaveformVisualizer />
            </RevealSection>

            {/* Hero value cards — adapted from 23gradi's 01/02/03 pattern */}
            <RevealSection className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  title: "Premium Sound",
                  desc: "Industry-standard mixes. Every beat mixed and mastered for release-ready quality.",
                },
                {
                  num: "02",
                  title: "Exclusive Rights",
                  desc: "Full ownership available. Once you buy exclusive, the beat is yours alone — forever.",
                },
                {
                  num: "03",
                  title: "Instant Delivery",
                  desc: "Download immediately after purchase. Stems and project files included with premium tiers.",
                },
              ].map((card) => (
                <div
                  key={card.num}
                  className="p-6 border border-border rounded-lg hover:border-purple/30 transition-colors"
                >
                  <span className="font-mono text-3xl font-bold text-purple/20">
                    {card.num}
                  </span>
                  <h3 className="font-display text-lg font-bold mt-3">
                    {card.title}
                  </h3>
                  <p className="text-text-sec text-sm mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </RevealSection>
          </div>

          <Marquee />
        </section>

        {/* ═══ SECTION 002 — BEAT CATALOG ═══ */}
        <section id="catalog" className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <RevealSection>
              <SectionNumber n="002" />
              <div className="mt-6 mb-4">
                <span className="font-mono text-sm text-text-dim uppercase tracking-widest">
                  Beat Catalog
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
                Every beat tells a story.{" "}
                <span className="text-text-sec">Find yours.</span>
              </h2>
              <p className="mt-4 text-text-sec max-w-xl leading-relaxed">
                Hand-crafted instrumentals ranging from dark ambient trap to
                hard-hitting drill. Preview, lease, or buy exclusive — your
                call.
              </p>
            </RevealSection>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BEATS.map((beat) => (
                <RevealSection key={beat.id}>
                  <BeatCard
                    beat={beat}
                    isPlaying={playingId === beat.id}
                    onToggle={() =>
                      setPlayingId(playingId === beat.id ? null : beat.id)
                    }
                  />
                </RevealSection>
              ))}
            </div>

            {/* Pricing tiers — adapted from 23gradi's product spec cards */}
            <RevealSection className="mt-20">
              <h3 className="font-display text-2xl font-bold mb-8 text-center">
                License Tiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    name: "MP3 Lease",
                    price: "$29.99",
                    features: [
                      "Tagged MP3",
                      "5K streams",
                      "Non-profit use",
                    ],
                  },
                  {
                    name: "WAV Lease",
                    price: "$49.99",
                    features: [
                      "Untagged WAV",
                      "50K streams",
                      "Music videos",
                    ],
                  },
                  {
                    name: "Trackout",
                    price: "$99.99",
                    features: [
                      "Individual stems",
                      "Unlimited streams",
                      "Commercial use",
                    ],
                    highlight: true,
                  },
                  {
                    name: "Exclusive",
                    price: "Varies",
                    features: [
                      "Full ownership",
                      "All files + project",
                      "Beat removed from store",
                    ],
                  },
                ].map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-6 rounded-lg border ${
                      tier.highlight
                        ? "border-purple bg-purple/5"
                        : "border-border"
                    }`}
                  >
                    <h4 className="font-display font-bold text-lg">
                      {tier.name}
                    </h4>
                    <p
                      className={`font-display text-2xl font-bold mt-2 ${
                        tier.highlight ? "text-purple" : "text-text"
                      }`}
                    >
                      {tier.price}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {tier.features.map((f) => (
                        <li
                          key={f}
                          className="text-sm text-text-sec flex items-center gap-2"
                        >
                          <span className="text-purple text-xs">&#9679;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ═══ SECTION 003 — ABOUT ═══ */}
        <section id="about" className="py-20 md:py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <RevealSection>
              <SectionNumber n="003" />
              <div className="mt-6 mb-4">
                <span className="font-mono text-sm text-text-dim uppercase tracking-widest">
                  About the Producer
                </span>
              </div>
            </RevealSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
              <RevealSection>
                <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                  Crafting darkness{" "}
                  <span className="text-purple">since day one.</span>
                </h2>
                <div className="mt-8 space-y-6 text-text-sec leading-relaxed">
                  <p>
                    808 GXOOSE is a production brand built on the foundation of
                    heavy bass, dark melodies, and meticulous sound design. Every
                    beat is crafted from scratch — no loops, no shortcuts.
                  </p>
                  <p>
                    From late-night sessions to studio lockdowns, the process is
                    always the same: start with the 808, build the atmosphere,
                    let the melody breathe. The result is instrumentals that hit
                    hard and leave space for the artist to create.
                  </p>
                  <p>
                    Credits span independent releases to major placements.
                    Whether you need a dark trap anthem or a melodic drill
                    instrumental, every project gets the same attention to
                    detail.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-6">
                  {[
                    { value: "500+", label: "Beats Produced" },
                    { value: "100+", label: "Artists Served" },
                    { value: "50M+", label: "Total Streams" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="font-display text-2xl md:text-3xl font-bold text-purple">
                        {stat.value}
                      </div>
                      <div className="text-xs text-text-dim uppercase tracking-wider mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </RevealSection>

              {/* FAQ accordion — adapted from 23gradi's 003 section */}
              <RevealSection>
                <div className="border-t border-border">
                  {FAQ.map((item, i) => (
                    <FAQItem
                      key={i}
                      item={item}
                      index={i}
                      isOpen={openFaq === i}
                      onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                    />
                  ))}
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 004 — CONTACT ═══ */}
        <section id="contact" className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <RevealSection>
              <SectionNumber n="004" />
              <div className="mt-6 mb-4">
                <span className="font-mono text-sm text-text-dim uppercase tracking-widest">
                  Get In Touch
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
                Ready to work?{" "}
                <span className="text-text-sec">Let&apos;s create.</span>
              </h2>
            </RevealSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
              <RevealSection>
                <div className="space-y-8">
                  {[
                    {
                      label: "Licensing",
                      desc: "Questions about beat licensing, bulk deals, or exclusive purchases.",
                      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                    },
                    {
                      label: "Custom Production",
                      desc: "Need a beat tailored to your style? Share your references and vision.",
                      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 2h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V3L8 2z",
                    },
                    {
                      label: "Collaborations",
                      desc: "Open to working with other producers, engineers, and artists.",
                      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex gap-5 p-5 border border-border rounded-lg hover:border-purple/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center shrink-0">
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={item.icon}
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display font-bold">{item.label}</h3>
                        <p className="text-sm text-text-sec mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </RevealSection>

              <RevealSection>
                <form
                  className="space-y-5"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-text-dim uppercase tracking-wider mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-purple transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-dim uppercase tracking-wider mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-purple transition-colors"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-dim uppercase tracking-wider mb-2">
                      Subject
                    </label>
                    <select className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-purple transition-colors">
                      <option>Beat Licensing</option>
                      <option>Custom Production</option>
                      <option>Exclusive Purchase</option>
                      <option>Collaboration</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-dim uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-dim focus:outline-none focus:border-purple transition-colors resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                </form>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-border py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="font-display text-2xl font-bold tracking-tight">
                  808 <span className="text-purple">GXOOSE</span>
                </div>
                <p className="text-text-sec text-sm mt-3 leading-relaxed max-w-xs">
                  Premium dark trap production. Every beat handcrafted with
                  precision and soul.
                </p>
              </div>
              <div>
                <h4 className="font-mono text-xs text-text-dim uppercase tracking-widest mb-4">
                  Quick Links
                </h4>
                <div className="space-y-3">
                  {["Beats", "Catalog", "About", "Contact"].map((link) => (
                    <a
                      key={link}
                      href={`#${link.toLowerCase()}`}
                      className="block text-text-sec hover:text-text transition-colors text-sm"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-mono text-xs text-text-dim uppercase tracking-widest mb-4">
                  Connect
                </h4>
                <div className="flex gap-4">
                  {[
                    {
                      name: "Instagram",
                      path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 1h11A5.5 5.5 0 0123 6.5v11a5.5 5.5 0 01-5.5 5.5h-11A5.5 5.5 0 011 17.5v-11A5.5 5.5 0 016.5 1z",
                    },
                    {
                      name: "YouTube",
                      path: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z",
                    },
                    {
                      name: "Twitter",
                      path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
                    },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center text-text-dim hover:text-purple hover:bg-purple/10 transition-colors"
                      aria-label={social.name}
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={social.path}
                        />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-text-dim">
                &copy; {new Date().getFullYear()} 808 GXOOSE. All rights
                reserved.
              </p>
              <div className="flex gap-6 text-xs text-text-dim">
                <a href="#" className="hover:text-text-sec transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-text-sec transition-colors">
                  License Agreement
                </a>
                <a href="#" className="hover:text-text-sec transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
