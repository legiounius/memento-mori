import { Link } from 'wouter';
import { motion } from 'framer-motion';
import skullImage from "@assets/skull_minimal.png";

const STORAGE_KEY = "memento-birthdate";

export default function Philosophy() {
  const hasBirthdate = !!localStorage.getItem(STORAGE_KEY);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative">
      <header className="w-full max-w-[900px] mx-auto pt-4 pb-1 px-4 md:px-8 text-center flex flex-col items-center space-y-1 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <div className="flex items-center gap-1.5 justify-center" style={{ paddingLeft: '0.35em' }}>
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Live</span>
            <img src={skullImage} alt="Memento Mori" className="w-[30px] h-[30px] object-contain" />
            <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Aware</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mt-0.5">
            Memento Mori
          </h1>
          <Link href="/" className="mt-2 text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground/60" data-testid="link-back-to-life">
            Back To Life
          </Link>
        </motion.div>
      </header>

      <main className="w-full max-w-[600px] mx-auto px-6 py-8 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-lg font-bold tracking-wide uppercase text-foreground mb-8">The Philosophy</h2>

          <div className="space-y-8 text-sm text-foreground/70 leading-relaxed">
            <section>
              <h3 className="text-base font-bold tracking-wide text-foreground mb-3">Memento Mori: "Remember That You Must Die"</h3>
              <p><strong className="text-foreground/90">Memento Mori</strong> is the philosophical and spiritual practice of keeping one's own mortality constantly in mind — not to induce fear or despair, but to live more fully, gratefully, and virtuously in the present.</p>
            </section>

            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Origin</h3>
              <p>The phrase and ritual emerged in ancient Rome. During a general's triumphal parade, a slave stood behind him whispering "Memento mori" ("Remember you are mortal") to prevent hubris. The idea was quickly adopted and systematized by the Stoic philosophers (3rd century BCE–2nd century CE), especially Seneca, Epictetus, and Marcus Aurelius, who made daily contemplation of death the cornerstone of their ethics.</p>
            </section>

            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Core Philosophical Groups</h3>
              <ul className="space-y-2 text-foreground/60">
                <li><strong className="text-foreground/80">Stoics</strong> (primary) — death awareness strips away trivial concerns and reveals what is truly up to us.</li>
                <li><strong className="text-foreground/80">Epicureans</strong> — used it to remove the terror of death so one could enjoy life without anxiety.</li>
                <li>Later: Existentialists (Camus, Sartre) and modern secular mindfulness traditions.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Embedded in Every Major Religion</h3>
              <p className="mb-3">The same principle appears universally, often as a path to wisdom and salvation:</p>
              <ul className="space-y-3 text-foreground/60">
                <li><strong className="text-foreground/80">Christianity</strong>: Medieval "memento mori" art (skulls, hourglasses), Ash Wednesday ("Remember you are dust, and to dust you shall return"), and monastic reflection on the Four Last Things.</li>
                <li><strong className="text-foreground/80">Buddhism</strong>: <em>Maranasati</em> (death meditation) and the teaching of <em>anicca</em> (impermanence) — central to reducing attachment and attaining enlightenment.</li>
                <li><strong className="text-foreground/80">Islam</strong>: Frequent <em>dhikr al-mawt</em> (remembrance of death) urged by the Prophet: "Remember often the destroyer of pleasures."</li>
                <li><strong className="text-foreground/80">Hinduism</strong>: Meditation on Yama (lord of death) and the transient nature of samsara to cultivate detachment and dharma.</li>
                <li><strong className="text-foreground/80">Judaism</strong>: "Teach us to number our days" (Psalm 90) and the practice of visiting graves.</li>
              </ul>
            </section>

            <section className="border-t border-border pt-6">
              <p className="text-foreground/80 italic">In every tradition, remembering death is not morbid — it is the ultimate life-affirming discipline: it clarifies priorities, dissolves ego, and opens the heart to love, presence, and meaning.</p>
            </section>

            <div className="pt-4 text-center">
              <Link
                href="/"
                className="text-[11px] font-bold text-foreground/70 hover:text-foreground transition-colors tracking-widest uppercase underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground/60"
                data-testid="link-back-bottom"
              >
                {hasBirthdate ? "Back To Life" : "Begin Your Journey"}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 text-[8px] text-muted-foreground/40">
          <Link href="/privacy" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-privacy-policy">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-terms">Terms of Use</Link>
          <span>&middot;</span>
          <a href="mailto:eric@legiounius.com" className="hover:text-foreground/60 transition-colors tracking-widest uppercase" data-testid="link-contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}
