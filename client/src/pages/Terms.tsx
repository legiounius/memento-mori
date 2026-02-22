import { Link } from 'wouter';
import { motion } from 'framer-motion';
import skullImage from "@assets/skull_minimal.png";

export default function Terms() {
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
        <h2 className="text-lg font-bold tracking-wide uppercase text-foreground mb-6">Terms of Use</h2>
        <p className="text-[10px] text-muted-foreground/50 mb-6">Last updated: February 2026</p>

        <div className="space-y-6 text-sm text-foreground/70 leading-relaxed">
          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Acceptance of Terms</h3>
            <p>By accessing or using Memento Mori ("the App"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the App.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Description of the App</h3>
            <p>Memento Mori is a personal life visualization and philosophical reflection tool. The App displays a visual representation of your life in weeks/months and provides curated passages from historical philosophical, religious, and literary sources for contemplation.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Use of the App</h3>
            <p>The App is provided for personal, non-commercial use. You may:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-foreground/60">
              <li>Use the life visualization for personal reflection</li>
              <li>Read and save passages for personal contemplation</li>
              <li>Share individual passages with others via the share feature</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Intellectual Property</h3>
            <p>The philosophical, religious, and literary passages included in the App are sourced from works in the public domain. The App's design, code, and original content are protected by copyright.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Disclaimer</h3>
            <p>The App is provided "as is" without warranties of any kind, either express or implied. The passages and content are provided for reflective and educational purposes only and do not constitute professional advice of any kind — medical, psychological, spiritual, or otherwise.</p>
            <p className="mt-2">The App deals with themes of mortality and the human condition. If you are experiencing distress, please reach out to a mental health professional or contact a crisis helpline.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Limitation of Liability</h3>
            <p>To the fullest extent permitted by law, the creators of the App shall not be liable for any damages arising from the use or inability to use the App, including but not limited to direct, indirect, incidental, or consequential damages.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Data and Privacy</h3>
            <p>All user data is stored locally on your device. We do not collect, store, or process any personal information. For full details, please refer to our <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-inline-privacy">Privacy Policy</Link>.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Changes to These Terms</h3>
            <p>We reserve the right to update these Terms of Use at any time. Continued use of the App after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Contact</h3>
            <p>For questions about these Terms of Use, please contact us at <a href="mailto:floorzero@gmail.com" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-contact-email">floorzero@gmail.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
