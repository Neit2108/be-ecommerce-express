import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export class DateUtils {
  static now(): Date {
    return new Date();
  }

  static startOfDay(date?: Date): Date {
    return dayjs(date).startOf('day').toDate();
  }

  static endOfDay(date?: Date): Date {
    return dayjs(date).endOf('day').toDate();
  }

  static startOfWeek(date?: Date): Date {
    return dayjs(date).startOf('week').toDate();
  }

  static startOfMonth(date?: Date): Date {
    return dayjs(date).startOf('month').toDate();
  }

  static startOfYear(date?: Date): Date {
    return dayjs(date).startOf('year').toDate();
  }

  static addDays(date: Date, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
  }

  static subtractDays(date: Date, days: number): Date {
    return dayjs(date).subtract(days, 'day').toDate();
  }

  static calculateAge(birthday: Date): number {
    return dayjs().diff(dayjs(birthday), 'year');
  }

  static isValidDate(date: any): boolean {
    return dayjs(date).isValid();
  }

  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    return dayjs(date).format(format);
  }
}