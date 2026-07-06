import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy · JN-CALM" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-white shadow-soft flex items-center justify-center border border-border/50">
              <img src="/logo.png" alt="JN-CALM Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-xl font-bold tracking-widest text-[#6E8C71]">JN-CALM</span>
          </Link>
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground shadow-peach transition-all hover:-translate-y-0.5"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: July 6, 2026</p>
          <hr className="border-border" />

          <div className="prose prose-stone max-w-none space-y-8 text-sm leading-relaxed text-stone-700">
            <p>
              Your privacy is extremely important to us at <strong>JN-CALM</strong> (the "Application"). This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Application.
            </p>
            <p>
              By using JN-CALM, you consent to the collection and use of information in accordance with this Privacy Policy.
            </p>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">1. Information We Collect</h2>
              <p>We collect your data to provide personalized emotional support and tracking features:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account Data</strong>: The email address you provide when registering an account.</li>
                <li><strong>Profile Data</strong>: Your nickname, age bracket, and personal well-being goals selected during the onboarding process.</li>
                <li><strong>Usage Data</strong>: Your diary entries, gratitude logs, habit trackers, and conversations with your AI companion. <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] inline-block ml-1">🔒 Strictly Private: Your chats & journals are personal; administrators or anyone else do not have access to view them.</span></li>
                <li><strong>Transaction Data</strong>: If you subscribe to our Premium Plan, payments are securely processed by our official partner (Mayar.id). We do not store your credit card details or virtual account credentials.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">2. How We Use Information</h2>
              <p>Your personal information is used for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide, maintain, and optimize features within the Application.</li>
                <li>To generate personalized responses from your selected AI companions.</li>
                <li>To compile and display your personal growth analytics (mood logs, streaks, journaling progress).</li>
                <li>To send essential emails, such as account verifications, password resets, and transaction alerts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">3. Security & Data Protection</h2>
              <p>
                All your chats, journals, and personal information are stored securely on encrypted database clusters (Supabase) using industry-standard configurations. Access to sensitive data is strictly restricted to automated backend systems necessary to deliver Application features.
              </p>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-900 text-xs">
                <strong>Journal Privacy Principle:</strong> Your daily entries, gratitude logs, and AI conversation history are <strong>confidential and private</strong>. We pledge <strong>never to sell or share</strong> your personal emotional writings with any third-party advertisers or marketing agencies.
              </div>
              <p className="text-xs text-muted-foreground mt-2.5 italic">
                Security Disclaimer: While we utilize industry-standard encryption to protect your data, no method of transmission or electronic storage is completely secure. We cannot guarantee absolute security against data breaches caused by hacking or unauthorized third-party actions beyond our control. You use this service at your own risk.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">4. Third-Party Services</h2>
              <p>
                We only share data with trusted third-party providers (such as AI model APIs for processing chat replies, and Supabase for database storage) to the minimum extent necessary to operate the Application. These service providers are legally bound to protect your data confidentiality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">5. Your Data Rights</h2>
              <p>
                You retain full control over your personal data. You are entitled to access your records, update your profile within the Application, or request the permanent deletion of your account along with all historical logs by contacting our support team.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">6. Policy Updates</h2>
              <p>
                We reserve the right to update this Privacy Policy at any time. Any changes will be indicated by updating the revision date at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your privacy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">7. Contact Us</h2>
              <p>
                If you have any questions or concerns regarding our handling of your personal data, please contact our support at <a href="mailto:noreply@jncalm.my.id" className="text-primary underline">noreply@jncalm.my.id</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Mini Footer */}
      <footer className="border-t border-border bg-card/25 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} JN-CALM. Made with 🤍 for weary minds.</p>
      </footer>
    </div>
  );
}
