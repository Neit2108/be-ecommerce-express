import cron, { ScheduledTask } from 'node-cron';
import { CashbackService } from './cashback.service';
import { PaymentService } from './payment.service';

export class CashbackCronService {
  private jobs: ScheduledTask[] = [];
  private isRunning: boolean = false;

  constructor(
    private cashbackService: CashbackService,
    private paymentService: PaymentService
  ) {}

  /**
   * Khởi động tất cả cronjobs
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Cashback cronjobs đã chạy');
      return;
    }

    console.log('🚀 Bắt đầu chạy cashback cronjob...');

    this.startProcessPendingCashbacksJob();
    this.startRetryFailedCashbacksJob();
    this.startCancelExpiredCashbacksJob();
    this.startProcessExpiredPaymentsJob();

    this.isRunning = true;
    console.log('✅ Cashback cronjobs đã được khởi động thành công');
  }

  /**
   * Dừng tất cả cronjobs
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️  Cashback cronjobs chưa được khởi động');
      return;
    }

    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    this.isRunning = false;
    console.log('🛑 Cashback cronjobs đã dừng lại');
  }

  /**
   * Lấy trạng thái của cronjobs
   */
  getStatus(): {
    isRunning: boolean;
    totalJobs: number;
    jobs: { name: string; schedule: string }[];
  } {
    return {
      isRunning: this.isRunning,
      totalJobs: this.jobs.length,
      jobs: [
        { name: 'Process Pending Cashbacks', schedule: '*/5 * * * *' },
        { name: 'Retry Failed Cashbacks', schedule: '*/30 * * * *' },
        { name: 'Cancel Expired Cashbacks', schedule: '0 * * * *' },
        { name: 'Process Expired Payments', schedule: '*/10 * * * *' },
      ],
    };
  }

  /**
   *  Xử lý pending cashbacks - chạy mỗi 5 phút
   * Gửi các cashback đã đủ điều kiện (eligibleAt <= now) lên blockchain
   */
  private startProcessPendingCashbacksJob(): void {
    const job = cron.schedule(
      '*/5 * * * *', // Mỗi 5 phút
      async () => {
        try {
          const startTime = Date.now();
          console.log('\n🔄 [CRON] Xử lý cashback đang chờ...');

          const results = await this.cashbackService.processPendingCashbacks(50);

          const successCount = results.filter((r) => r.success).length;
          const failCount = results.filter((r) => !r.success).length;
          const duration = Date.now() - startTime;

          console.log(
            `✅ [CRON] Đã xử lý ${successCount}/${results.length} cashback thành công (${failCount} thất bại) - Thời gian: ${duration}ms`
          );

          if (failCount > 0) {
            console.log(`❌ [CRON] Cashback thất bại:`, {
              failed: results.filter((r) => !r.success).map((r) => ({
                cashbackId: r.cashbackId,
                error: r.error,
              })),
            });
          }
        } catch (error) {
          console.error('❌ [CRON] Lỗi khi xử lý cashback:', error);
        }
      },
      {
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );

    this.jobs.push(job);
  }

  /**
   * Retry failed cashbacks - chạy mỗi 30 phút
   * Thử lại các cashback đã failed (tối đa 3 lần)
   */
  private startRetryFailedCashbacksJob(): void {
    const job = cron.schedule(
      '*/30 * * * *', // Mỗi 30 phút
      async () => {
        try {
          const startTime = Date.now();
          console.log('\n🔄 [CRON] Thử lại các cashback thất bại...');

          const results = await this.cashbackService.retryFailedCashbacks(3);

          const successCount = results.filter((r) => r.success).length;
          const duration = Date.now() - startTime;

          console.log(
            `✅ [CRON] Đã thử lại ${successCount}/${results.length} cashback - Thời gian: ${duration}ms`
          );

          if (results.length > 0) {
            console.log(`ℹ️  [CRON] Kết quả thử lại:`, {
              results: results.map((r) => ({
                cashbackId: r.cashbackId,
                success: r.success,
                message: r.message,
              })),
            });
          }
        } catch (error) {
          console.error('❌ [CRON] Lỗi khi thử lại cashback thất bại:', error);
        }
      },
      {
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );

    this.jobs.push(job);
  }

  /**
   * ✨ Cancel expired cashbacks - chạy mỗi 1 giờ
   * Hủy các cashback đã quá hạn claim (expiresAt < now)
   */
  private startCancelExpiredCashbacksJob(): void {
    const job = cron.schedule(
      '0 * * * *', // Mỗi giờ (phút 0)
      async () => {
        try {
          const startTime = Date.now();
          console.log('\n🔄 [CRON] Hủy các cashback đã hết hạn...');

          const count = await this.cashbackService.cancelExpiredCashbacks();
          const duration = Date.now() - startTime;

          console.log(
            `✅ [CRON] Đã hủy ${count} cashback đã hết hạn - Thời gian: ${duration}ms`
          );
        } catch (error) {
          console.error('❌ [CRON] Lỗi khi hủy cashback đã hết hạn:', error);
        }
      },
      {
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );

    this.jobs.push(job);
  }

  /**
   * ✨ Process expired payments - chạy mỗi 10 phút
   * Đánh dấu các payment đã hết hạn thanh toán (expiredAt < now) sang FAILED
   */
  private startProcessExpiredPaymentsJob(): void {
    const job = cron.schedule(
      '*/10 * * * *', // Mỗi 10 phút
      async () => {
        try {
          const startTime = Date.now();
          console.log('\n🔄 [CRON] Xử lý các thanh toán hết hạn...');

          const count = await this.paymentService.processExpiredPayments();
          const duration = Date.now() - startTime;

          console.log(
            `✅ [CRON] Đã xử lý ${count} thanh toán hết hạn - Thời gian: ${duration}ms`
          );
        } catch (error) {
          console.error('❌ [CRON] Lỗi khi xử lý thanh toán hết hạn:', error);
        }
      },
      {
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );

    this.jobs.push(job);
  }

  /**
   * Manual trigger - để test
   */
  async manualTrigger(jobName: string): Promise<any> {
    console.log(`🔧 [MANUAL] Triggering job: ${jobName}`);

    switch (jobName) {
      case 'processPending':
        return await this.cashbackService.processPendingCashbacks(50);

      case 'retryFailed':
        return await this.cashbackService.retryFailedCashbacks(3);

      case 'cancelExpired':
        return await this.cashbackService.cancelExpiredCashbacks();

      case 'processExpiredPayments':
        return await this.paymentService.processExpiredPayments();

      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}