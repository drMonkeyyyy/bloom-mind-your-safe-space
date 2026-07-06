import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service · JN-CALM" }] }),
  component: TermsPage,
});

function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: July 6, 2026</p>
          <hr className="border-border" />

          <div className="prose prose-stone max-w-none space-y-8 text-sm leading-relaxed text-stone-700">
            <p>
              Welcome to <strong>JN-CALM</strong> (the "Application"). This service is provided by JN-CALM as a safe space to help you manage your emotional well-being, write journals, track habits, and grow independently.
            </p>
            <p>
              By registering, accessing, or using the Application, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, you are not authorized to use the Application.
            </p>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">1. Service Limitations (IMPORTANT)</h2>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-amber-900 text-xs">
                <strong>Mental Health & Crisis Disclaimer:</strong> JN-CALM is an AI-powered self-reflection application. JN-CALM <strong>is not a professional mental health service, psychotherapy, or medical service provider</strong>. Our AI companions are designed for self-reflection and light conversational support, and are not a replacement for clinical diagnosis, medical treatment, or therapy by licensed psychologists or psychiatrists.
              </div>
              <p>
                If you are experiencing a severe emotional crisis, thoughts of self-harm, or any other psychiatric/medical emergency, please seek immediate help from a licensed professional or contact your local emergency services/crisis hotline.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">2. Account Registration</h2>
              <p>
                To utilize the full features of the Application, you are required to register an account by providing a valid email address and profile details. You are fully responsible for maintaining the confidentiality of your password and all activities that occur under your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">3. Intellectual Property Rights</h2>
              <p>
                All logos, trademarks, user interface designs, AI companions, algorithms, and written materials within the Application are the exclusive intellectual property of JN-CALM. Users are not permitted to copy, distribute, or modify any part of the Application without prior written consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">4. Premium Services and Payments</h2>
              <p>
                JN-CALM offers paid plans ("Premium Plan") with additional features, such as unlimited AI chats and habit trackers. Payments are securely processed through our official payment gateway partner (Mayar.id).
              </p>
              <p>
                All transactions are final, and subscription fees are non-refundable unless otherwise required by applicable laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">5. User Code of Conduct</h2>
              <p>
                You agree to use the Application only for lawful, ethical, and personal well-being purposes. You are strictly prohibited from uploading or inputting content that contains hate speech, discrimination, pornography, violence, or violates the privacy rights of others.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">6. Limitation of Liability & Security Risks</h2>
              <p>
                We are committed to protecting your data using industry-standard encryption methods. However, you acknowledge that no method of transmission over the Internet or method of electronic storage is 100% secure and free from hacking risks.
              </p>
              <p>
                Accordingly, JN-CALM shall not be held liable for any loss, data breach, leakage, or damage resulting from cyberattacks, unauthorized third-party access, system failures, or any event beyond our reasonable control (Force Majeure). Your use of the Application is entirely at your own risk and discretion.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify or update these Terms of Service at any time. We will notify you of any material changes by updating the revision date at the top of this page. Your continued use of the Application after such modifications constitutes your acceptance of the updated terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">8. Contact Us</h2>
              <p>
                If you have any questions regarding these Terms of Service, please contact our team at <a href="mailto:noreply@jncalm.my.id" className="text-primary underline">noreply@jncalm.my.id</a>.
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
