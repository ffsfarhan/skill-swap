'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, GitFork, User, Settings, LogOut, Bell, MessageSquare, Briefcase, Moon, Sun, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTheme } from "next-themes";
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/dashboard', label: 'Profile', icon: User },
  { href: '/dashboard/browse', label: 'Browse Skills', icon: Search },
  { href: '/dashboard/swaps', label: 'My Swaps', icon: GitFork },
];

const adminNavItems = [
    { href: '/dashboard/admin', label: 'Admin Panel', icon: ShieldCheck }
]

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[76px] h-5" />; // placeholder to prevent layout shift
    }

    return (
        <div className="flex items-center space-x-2">
            <Sun className="h-5 w-5"/>
            <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
            <Moon className="h-5 w-5"/>
        </div>
    );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleLogout = () => {
      logout();
      toast({ title: 'Logged out successfully.'})
      router.push('/login');
  }

  if (loading || !user) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="text-xl">Loading...</div>
          </div>
      );
  }

  const allNavItems = user.isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-3">
                <Briefcase className="size-8 text-primary" />
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold font-headline">SkillHub</h2>
                    <p className="text-xs text-muted-foreground">Swap. Learn. Grow.</p>
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {allNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <Separator className="my-2" />
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{children: 'Settings'}}>
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                     <SidebarMenuButton tooltip={{children: 'Logout'}} onClick={handleLogout}>
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold font-headline">
                    {allNavItems.find(item => pathname === item.href)?.label || 'Dashboard'}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>
                 <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                    <span className="sr-only">Messages</span>
                </Button>
                <Avatar>
                    <AvatarImage asChild>
                      <Image src={user.avatarUrl!} alt={user.name} width={40} height={40} data-ai-hint="profile avatar" />
                    </AvatarImage>
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
