export interface Restaurant {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    restaurantId: string | null;
    restaurantName: string | null;
    createdAt: string;
}

export interface Stats {
    restaurantCount: number;
    adminCount: number;
    totalBills: number;
}

export interface ReportSummary {
    totalSales: number;
    billCount: number;
    avgOrder: number;
    dineIn: { count: number; total: number };
    takeaway: { count: number; total: number };
}

export interface ReportsResponse {
    bills: any[];
    summary: ReportSummary;
}

export async function fetchStats(): Promise<Stats> {
    const res = await fetch("/api/superadmin/stats");
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
    const res = await fetch("/api/superadmin/restaurants");
    if (!res.ok) throw new Error("Failed to fetch restaurants");
    return res.json();
}

export async function createRestaurant(data: { name: string; address?: string; phone?: string }): Promise<Restaurant> {
    const res = await fetch("/api/superadmin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create restaurant");
    return res.json();
}

export async function updateRestaurant(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
    const res = await fetch(`/api/superadmin/restaurants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update restaurant");
    return res.json();
}

export async function deleteRestaurant(id: string): Promise<void> {
    const res = await fetch(`/api/superadmin/restaurants/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete restaurant");
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
    const res = await fetch("/api/superadmin/users");
    if (!res.ok) throw new Error("Failed to fetch admin users");
    return res.json();
}

export async function createAdminUser(data: { name: string; email: string; password: string; restaurantId?: string }): Promise<AdminUser> {
    const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create admin user");
    }
    return res.json();
}

export async function updateAdminUser(id: string, data: Partial<AdminUser & { password?: string }>): Promise<AdminUser> {
    const res = await fetch(`/api/superadmin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update admin user");
    }
    return res.json();
}

export async function deleteAdminUser(id: string): Promise<void> {
    const res = await fetch(`/api/superadmin/users/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete admin user");
}

export async function fetchReports(restaurantIds: string[], startDate?: string, endDate?: string): Promise<ReportsResponse> {
    const params = new URLSearchParams();
    if (restaurantIds.length > 0) params.set("restaurantIds", restaurantIds.join(","));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const res = await fetch(`/api/superadmin/reports?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
}
