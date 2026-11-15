import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardPlus,
  LayoutDashboard,
  UserRound,
} from "lucide-react"
// One list for both the desktop sidebar and the mobile menu
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training-plan", label: "Training Plan", icon: CalendarDays },
  { href: "/log-workout", label: "Log Workout", icon: ClipboardPlus },
  { href: "/analysis", label: "Analysis", icon: ChartNoAxesCombined },
  { href: "/learning-hub", label: "Learning Hub", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: UserRound },
]