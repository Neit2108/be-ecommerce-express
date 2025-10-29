export interface SummaryStats{
    title: string;
    value: number;
    change: number; // phần trăm thay đổi so với kỳ trước
    description?: string;
    trend?: string;
}