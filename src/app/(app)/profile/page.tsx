import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { requireOnboardedUser } from "@/lib/session"
import ProfileForm from "./profile-form"
import AvatarUploader from "@/components/avatar-uploader"
import { getHeaderUser } from "@/lib/header-user"
import Link from "next/link"
import DeleteAccountForm from "./delete-account-form"

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <PageHeader title="Profile & Settings" subtitle="Your account and training profile" />
      <ProfileContent />
    </ProtectedPage>
  )
}

async function ProfileContent() {
  const { user, profile } = await requireOnboardedUser()
  const account = await getHeaderUser()

  return (
    <div className="max-w-2xl space-y-6 p-6 md:p-10">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-xs font-bold uppercase text-muted">Profile picture</h2>
        <AvatarUploader image={account?.image ?? null} name={user.name} email={user.email} />
      </section>
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-1 text-xs font-bold uppercase text-muted">Account</h2>
        <p className="text-foreground">{user.email}</p>
        <p className="mt-1 text-xs text-muted">Your email cannot be changed.</p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-xs font-bold uppercase text-muted">
          Training profile
        </h2>
        <ProfileForm
          initial={{
            name: user.name ?? "",
            experienceLevel: profile.experienceLevel,
            goal: profile.goal,
            daysPerWeek: String(profile.daysPerWeek),
            minutesPerSession: String(profile.minutesPerSession ?? 60),
            targetRaceDate: profile.targetRaceDate?.toISOString().slice(0, 10) ?? "",
          }}
        />
        <p className="mt-4 text-xs text-muted">
          Changing these settings does not change your current plan. You will be
          able to generate a new plan from your updated profile on the Training Plan page.
        </p>
      </section>
            <section className="space-y-3 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-xs font-bold uppercase text-muted">Your data</h2>
        <p className="text-sm text-muted">
          See how we use your data in the{" "}
          <Link href="/privacy" className="text-link hover:underline">
            privacy notice
          </Link>
          . You can download everything we hold about you.
        </p>
        <a
          href="/api/export"
          download
          className="inline-flex items-center rounded-lg border border-green-700 bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-800 hover:bg-green-800 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 motion-reduce:transform-none motion-reduce:transition-none"
        >
          Download my data
        </a>
      </section>

      <section className="rounded-xl border border-danger/40 bg-surface p-6">
        <h2 className="mb-3 text-xs font-bold uppercase text-danger">Delete account</h2>
        <DeleteAccountForm email={user.email ?? ""} />
      </section>
    </div>
  )
}