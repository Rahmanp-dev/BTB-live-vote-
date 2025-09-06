import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Presentation } from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Presentation className="text-primary h-6 w-6" />
            <h1 className="text-lg font-bold">PitchRate Admin</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive>
                <Link href="/admin">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 border-b md:hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Presentation className="text-primary h-6 w-6" />
            <h1 className="text-lg font-bold">PitchRate Admin</h1>
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
