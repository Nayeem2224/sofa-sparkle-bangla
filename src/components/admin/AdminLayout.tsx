import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  CalendarCheck,
  Package,
  Clock,
  Settings,
  LogOut,
  Loader2,
  Gift,
  Users,
  Bell,
  Star,
  HelpCircle,
  BarChart3,
  Megaphone,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
  { title: "বুকিংসমূহ", url: "/admin/bookings", icon: CalendarCheck },
  { title: "ফলো-আপ", url: "/admin/follow-ups", icon: Bell },
  { title: "প্যাকেজসমূহ", url: "/admin/packages", icon: Package },
  { title: "অ্যাড-অনসমূহ", url: "/admin/addons", icon: Gift },
  { title: "টাইম স্লট", url: "/admin/time-slots", icon: Clock },
  { title: "টেস্টিমোনিয়াল", url: "/admin/testimonials", icon: Star },
  { title: "FAQ", url: "/admin/faqs", icon: HelpCircle },
  { title: "মার্কেটিং", url: "/admin/marketing", icon: BarChart3 },
  { title: "মার্কি ব্যানার", url: "/admin/marquee", icon: Megaphone },
  { title: "ভিডিও", url: "/admin/videos", icon: Video },
  { title: "অ্যাডমিন", url: "/admin/admins", icon: Users },
  { title: "সাইট সেটিংস", url: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <SidebarContent>
            <div className="p-4 border-b border-border/50">
              <h2 className="text-lg font-bold text-primary font-[Poppins]">Purexify</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>মেনু</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/admin"}
                          className="hover:bg-muted/50"
                          activeClassName="bg-primary/10 text-primary font-semibold"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto p-4 border-t border-border/50">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                লগ আউট
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 bg-background px-4 shrink-0">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
