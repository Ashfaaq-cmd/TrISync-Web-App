import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <PageHeader
        title="Profile Page"
        subtitle="Your personalised swim, bike and run schedule"
      />
      <p className="p-6 text-muted md:p-10">Coming soon.</p>
    </ProtectedPage>
  )
}