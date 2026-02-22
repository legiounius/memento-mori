import { Link } from 'wouter';
import { motion } from 'framer-motion';
import skullImage from "@assets/skull_minimal.png";

export default function PrivacyPolicy() {
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
        <h2 className="text-lg font-bold tracking-wide uppercase text-foreground mb-6">Privacy Policy</h2>
        <p className="text-[10px] text-muted-foreground/50 mb-6">Last updated: February 2026</p>

        <div className="space-y-6 text-sm text-foreground/70 leading-relaxed">
          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Overview</h3>
            <p>Memento Mori ("the App") is a personal life visualization and wisdom reflection tool. Your privacy is important to us. This policy explains what information we collect, how we use it, and your rights.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Information We Collect</h3>
            <p>The App stores all personal data locally on your device using your browser's localStorage. This includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-foreground/60">
              <li>Your birthdate and target age</li>
              <li>Life events you create</li>
              <li>Favorite passages you save</li>
              <li>Passage viewing history (for no-repeat functionality)</li>
            </ul>
            <p className="mt-2">This data never leaves your device. We do not collect, transmit, or store any personal information on our servers.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">No Accounts or Registration</h3>
            <p>The App does not require user accounts, registration, login, or authentication of any kind. There are no passwords, email addresses, or usernames collected.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Cookies and Tracking</h3>
            <p>The App does not use cookies, analytics, advertising trackers, or any third-party tracking services. We do not track your usage, behavior, or browsing activity.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Third-Party Services</h3>
            <p>The App loads fonts from Google Fonts for display purposes. No other third-party services are used. The share feature uses your device's native sharing capabilities and does not route through our servers.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Data Deletion</h3>
            <p>Since all data is stored locally on your device, you can delete it at any time by clearing your browser's localStorage or uninstalling the App. We have no data to delete on our end.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Children's Privacy</h3>
            <p>The App does not knowingly collect any information from children under the age of 13. The App is a general-audience reflection tool with no age-restricted content.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Changes to This Policy</h3>
            <p>We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date.</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 mb-2">Contact</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:floorzero@gmail.com" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-contact-email">floorzero@gmail.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
