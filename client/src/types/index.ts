export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface License {
    id: number;
    key: string;
    category: number;
    category_name: string;
    is_active: boolean;
    is_used: boolean;
    device_id: string;
    created_at: string;
}

export interface DailyRequest {
    date: string;
    count: number;
    avg_time: number;
}

export interface CategoryStat {
    category__name: string;
    count: number;
}

export interface DashboardStats {
    daily_requests: DailyRequest[];
    category_stats: CategoryStat[];
    overall: {
        total_licenses: number;
        active_licenses: number;
        used_licenses: number;
        avg_response_time: number;
    }
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
