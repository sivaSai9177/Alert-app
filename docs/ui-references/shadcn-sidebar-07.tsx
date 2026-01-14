/**
 * shadcn sidebar-07 block reference
 * This is the original web-based sidebar-07 block from shadcn
 * Shows the collapsible icon sidebar with team switcher
 */

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// AppSidebar component structure:
// - Uses collapsible="icon" mode
// - Has TeamSwitcher in header
// - NavMain for main navigation with collapsible sections
// - NavProjects for project list
// - NavUser in footer with dropdown menu