import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, ShoppingCart, User, UserPen, Users, Briefcase } from 'lucide-react';
import AppLogo from './app-logo';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';


export function AppSidebar() {
    const { user, checkAuth } = useAuth();

    useEffect(() => {
        checkAuth();
    }, []);

    const mainNavItems = user?.role === "admin"
        ? [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Marketplace',
                href: '/',
                icon: ShoppingCart,
            },
            {
                title: 'User Management',
                icon: Users,
                href: '/admin',
                dropdown: true,
                items: [
                    {
                        title: 'Users',
                        href: '/admin/users-list',
                        icon: User,
                    },
                    {
                        title: 'Agent Applications',
                        href: '/admin/agent-applications',
                        icon: UserPen,
                    },
                    {
                        title: 'Categories',
                        href: '/admin/categories',
                        icon: Folder,
                    },
                    {
                        title: 'Products',
                        href: '/admin/products',
                        icon: ShoppingCart,
                    },
                ],
            },
            {
                title: 'Job Management',
                icon: Briefcase,
                href: '/admin/jobs',
                dropdown: true,
                items: [
                    {
                        title: 'Jobs',
                        href: '/admin/jobs',
                        icon: Briefcase,
                    },
                    {
                        title: 'Job Applications',
                        href: '/admin/job-applications',
                        icon: UserPen,
                    },
                ],
            }
        ]
        : [
            {
                title: 'Dashboard',
                href: '/agent/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Sales',
                href: '/agent/sales',
                icon: Folder,
            },
            {
                title: 'Earnings',
                href: '/agent/earnings',
                icon: BookOpen,
            },
        ];

    const footerNavItems: NavItem[] = [

    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
