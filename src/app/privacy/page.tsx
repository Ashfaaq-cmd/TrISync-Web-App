import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import ThemedLogo from "@/components/themed-logo"

export const metadata: Metadata = { title: "Privacy notice | TriSync" }

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 space-y-2">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

const listClass = "list-disc space-y-1 pl-6 text-foreground"

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" aria-label="TriSync home" className="inline-block">
        <ThemedLogo className="h-auto w-32" />
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-foreground">Privacy notice</h1>
      <p className="mt-1 text-sm text-muted">Draft, November 2026</p>

      <p className="mt-4 rounded-lg bg-primary-soft px-4 py-3 text-sm text-foreground">
        TriSync is a student prototype. This notice is a draft written for the project
        and has not been legally reviewed.
      </p>

      <Section title="Who runs TriSync">
        <p className="text-foreground">
          TriSync is a final-year project for the BSc (Hons) Web and Multimedia
          Development at the University of Mauritius, built by Ashfaaq Dulloo. It is a
          prototype, not a commercial service.
        </p>
      </Section>

      <Section title="What we collect">
        <ul className={listClass}>
          <li>Your name and email address, and a profile picture if you add one.</li>
          <li>
            Your password, stored only as a one-way hash, or your Google account details
            (name, email and photo) if you sign in with Google.
          </li>
          <li>
            Your training profile: experience level, goal, training days, session length
            and race date.
          </li>
          <li>
            Your logged sessions: date, discipline, duration, distance, heart rate,
            pace, speed and any notes you write.
          </li>
          <li>Your training plans, the AI feedback on your sessions and your monthly AI summaries.</li>
        </ul>
        <p className="text-foreground">
          Heart rate and training data relate to your health, so please only enter what
          you are comfortable with.
        </p>
      </Section>

      <Section title="How we use it">
        <ul className={listClass}>
          <li>To run the app: your plans, logs, charts, feedback and summaries.</li>
          <li>
            To evaluate the prototype for the dissertation. [Describe whether results are
            anonymised and how long they are kept, after your ethics guidance.]
          </li>
        </ul>
        <p className="text-foreground">
          We do not sell your data, show adverts or use tracking or analytics services.
        </p>
      </Section>

      <Section title="The AI features">
        <p className="text-foreground">
          Plans, session feedback and monthly summaries are written with Google&apos;s
          Gemini service. We send only:
        </p>
        <ul className={listClass}>
          <li>
            For a plan: your level, goal, training days, session length, race date, a
            summary of your recent training minutes, and whether you said you are
            unwell.
          </li>
          <li>
            For session feedback: that session&apos;s duration, distance, pace or speed
            and heart rate, its planned target, and averages of your recent sessions.
          </li>
          <li>For a monthly summary: totals and averages of your logged sessions.</li>
        </ul>
        <p className="text-foreground">
          We never send your name, email, notes or account ID. On its free tier, Google
          may use content sent to its service to improve its products. Data already sent
          to Google cannot be recalled by deleting your account here. AI output is
          general guidance, not medical advice or a replacement for a qualified coach.
        </p>
      </Section>

      <Section title="Where your data is kept">
        <ul className={listClass}>
          <li>The database is hosted by Neon in Singapore.</li>
          <li>The app runs on Vercel, and profile pictures are stored with Vercel Blob.</li>
          <li>Google handles sign-in if you choose Google.</li>
        </ul>
      </Section>

      <Section title="Cookies and browser storage">
        <p className="text-foreground">
          A secure cookie keeps you signed in, and your light or dark theme choice is
          saved in your browser. There are no advertising or tracking cookies.
        </p>
      </Section>

      <Section title="Your choices">
        <ul className={listClass}>
          <li>Edit your profile, and change or remove your picture, on the Profile page.</li>
          <li>Download everything we hold about you as a file.</li>
          <li>
            Delete your account. This is immediate and permanent: your profile, plans,
            logs, summaries and picture are removed.
          </li>
        </ul>
        <p className="text-foreground">
          All three are on the{" "}
          <Link href="/profile" className="text-link hover:underline">
            Profile page
          </Link>
          . You can also contact the address above.
        </p>
      </Section>
    </main>
  )
}