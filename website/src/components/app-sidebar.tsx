import Image from "next/image";
import Link from "next/link";
import {
  CircleDot,
  Shield,
  Hand,
  Trophy,
  BarChart3,
  ArrowLeftRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const sportsItems = [
  { title: "Football", url: "/football", icon: CircleDot },
  { title: "Rugby", url: "/rugby", icon: Shield },
  { title: "Handball", url: "/handball", icon: Hand },
  { title: "Basketball", url: "/basketball", icon: Trophy },
];

const comparisonItems = [
  { title: "Leagues", url: "/leagues", icon: BarChart3 },
  { title: "Compare", url: "/compare", icon: ArrowLeftRight },
];

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      style={{ "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Image src="/icon.png" alt="Logo" width={24} height={24} className="shrink-0" />
          <span className="font-semibold text-sm truncate">Sport Data</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sportsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-2 w-full">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Comparison</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comparisonItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-2 w-full">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
