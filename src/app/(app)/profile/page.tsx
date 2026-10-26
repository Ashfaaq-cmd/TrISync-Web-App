import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { requireOnboardedUser } from "@/lib/session"
import ProfileForm from "./profile-form"

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

  return (
    <div className="max-w-2xl space-y-6 p-6 md:p-10">
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
    </div>
  )
}