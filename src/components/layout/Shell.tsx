"use client";

import { useAuth, User } from "@/lib/hooks/useAuth";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Menu as MenuIcon,
    Users,
    Settings,
    LogOut,
    FileText,
    BarChart3,
    Map,
    Table as TableIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
    title: string;
    href: string;
    icon: any;
    roles: ("admin" | "cashier")[];
}

const navItems: NavItem[] = [
    {
        title: "POS Billing",
        href: "/pos",
        icon: UtensilsCrossed,
        roles: ["admin", "cashier"],
    },
    {
        title: "Bill History",
        href: "/pos/history",
        icon: FileText,
        roles: ["admin", "cashier"],
    },
    {
        title: "Admin Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["admin"],
    },
    {
        title: "Menu Items",
        href: "/admin/menu",
        icon: MenuIcon,
        roles: ["admin"],
    },
    {
        title: "Tables & Floors",
        href: "/admin/floors",
        icon: Map,
        roles: ["admin"],
    },
    {
        title: "Sales Reports",
        href: "/admin/reports",
        icon: BarChart3,
        roles: ["admin"],
    },
    {
        title: "Audit Logs",
        href: "/admin/audit",
        icon: FileText,
        roles: ["admin"],
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        roles: ["admin"],
    },
];

export default function Shell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return <>{children}</>;

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(user.role)
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/30 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight">MANA MANDI</h1>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">
                        {user.role} Portal
                    </p>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3 h-10",
                                        isActive && "bg-secondary font-medium"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t space-y-2">
                    <div className="px-2 py-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
