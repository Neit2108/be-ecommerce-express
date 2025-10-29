import { IUnitOfWork } from '../repositories/interfaces/uow.interface';
import { SummaryStats } from '../types/admin.types';

export class AdminService {
  constructor(private uow: IUnitOfWork) {}

  async getSummaryStats(): Promise<SummaryStats[]> {
    const now = new Date();

    // tuần hiện tại
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // ngày thứ Hai
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // ngày Chủ Nhật

    // tuần trước
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);

    let stats: SummaryStats[] = [];

    // Doanh thu
    const revenueThisWeek = await this.uow.orders.sumRevenue({
      createdAt: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    });

    const revenueLastWeek = await this.uow.orders.sumRevenue({
      createdAt: {
        gte: startOfLastWeek,
        lt: endOfLastWeek,
      },
    });

    stats.push({
      title: 'Doanh thu',
      value: revenueThisWeek,
      change: this.calculateChange(revenueThisWeek, revenueLastWeek),
      description: 'Tổng doanh thu trong tuần',
      trend:
        revenueThisWeek > revenueLastWeek
          ? 'Doanh thu tăng, tuyệt vời lắm.'
          : 'Doanh thu giảm, cần cải thiện.',
    });

    // Số đơn hàng
    const ordersThisWeek = await this.uow.orders.count({
      createdAt: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    });

    const ordersLastWeek = await this.uow.orders.count({
      createdAt: {
        gte: startOfLastWeek,
        lt: endOfLastWeek,
      },
    });

    stats.push({
      title: 'Số đơn hàng',
      value: ordersThisWeek,
      change: this.calculateChange(ordersThisWeek, ordersLastWeek),
      description: 'Tổng số đơn hàng trong tuần',
      trend:
        ordersThisWeek > ordersLastWeek
          ? 'Số đơn hàng tăng, tuyệt vời lắm.'
          : 'Số đơn hàng giảm, cần cải thiện.',
    });

    // Khách hàng mới
    const usersThisWeek = await this.uow.users.count({
      createdAt: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    });

    const usersLastWeek = await this.uow.users.count({
      createdAt: {
        gte: startOfLastWeek,
        lt: endOfLastWeek,
      },
    });

    stats.push({
      title: 'Khách hàng mới',
      value: usersThisWeek,
      change: this.calculateChange(usersThisWeek, usersLastWeek),
      description: 'Tổng số khách hàng mới trong tuần',
      trend:
        usersThisWeek > usersLastWeek
          ? 'Số khách hàng mới tăng, tuyệt vời lắm.'
          : 'Số khách hàng mới giảm, cần cải thiện.',
    });

    // trung bình giá trị đơn hàng
    const avgOrderValueThisWeek =
      ordersThisWeek === 0 ? 0 : revenueThisWeek / ordersThisWeek;
    const avgOrderValueLastWeek =
      ordersLastWeek === 0 ? 0 : revenueLastWeek / ordersLastWeek;

    stats.push({
      title: 'Giá trị đơn hàng trung bình',
      value: avgOrderValueThisWeek,
      change: this.calculateChange(avgOrderValueThisWeek, avgOrderValueLastWeek),
      description: 'Giá trị đơn hàng trung bình trong tuần',
      trend:
        avgOrderValueThisWeek > avgOrderValueLastWeek
          ? 'Giá trị đơn hàng trung bình tăng, tuyệt vời lắm.'
          : 'Giá trị đơn hàng trung bình giảm, cần cải thiện.',
    });

    return stats;
  }

  calculateChange(current: number, previous: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    return ((current - previous) / previous) * 100;
  }
}
