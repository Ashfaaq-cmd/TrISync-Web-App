import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { requireOnboardedUser } from "@/lib/session"

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <PageHeader
        title="Dashboard"
        subtitle="This week's overview across swim, bike and run"
      />
      <DashboardContent />
    </ProtectedPage>
  )
}

async function DashboardContent() {
  const { user } = await requireOnboardedUser()

  return (
    <div className="p-6 md:p-10">
      <p className="text-foreground">Welcome back, {user.name ?? user.email}.</p>
      <p className="mt-1 text-sm text-muted">
        Stats and charts will appear here once training data exists.
      </p>
    </div>
  )
}