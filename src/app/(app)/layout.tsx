
'use client'

import React from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { BrainCircuit, LayoutDashboard, Bot, Calendar, Settings, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/(auth)/context';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // We want to wait until loading is complete before checking for a user.
    if (!loading && !user) {
      // If there's no user, redirect to the login page.
      router.push('/');
    }
  }, [user, loading, router]);

  // While authentication is in progress, show a loading indicator.
  // This prevents a "flash" of the login page or an empty layout.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If there is no user, we will be redirected, so we can render nothing or a loading indicator
  // to prevent the layout from briefly appearing before the redirect happens.
  if (!user) {
    return null;
  }


  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-gradient" />
                        <h1 className="text-xl font-bold font-headline tracking-tight text-gradient">
                            FlowTask AI
                        </h1>
                        <SidebarTrigger />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                                <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/assistant'}>
                                <Link href="/assistant"><Bot /><span>AI Assistant</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/calendar'}>
                                <Link href="/calendar"><Calendar /><span>Calendar</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                     <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/profile'}>
                                <Link href="/profile"><User /><span>Profile</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                                <Link href="/settings"><Settings /><span>Settings</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/trash'}>
                                <Link href="/trash"><Trash2 /><span>Trash</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <main className="flex-1">
                {children}
            </main>
        </div>
    </SidebarProvider>
  );
}
