import { Store, signal } from 'fiboui';
import { PerformanceService } from '../Services/PerformanceService';

@Store()
export class PerformanceViewModel {
  isOnline = signal(false);
  earnings = signal(0);
  sheetY = signal(0);

  public service: PerformanceService;
  private updateInterval: number | null = null;

  constructor() {
    this.service = new PerformanceService();
  }

  toggleOnlineStatus(): void {
    this.isOnline.value = !this.isOnline.value;

    if (this.isOnline.value) {
      this.startEarningsSimulation();
    } else {
      this.stopEarningsSimulation();
    }
  }

  private startEarningsSimulation(): void {
    this.stopEarningsSimulation();
    if (typeof window === 'undefined') return;
    this.updateInterval = window.setInterval(() => {
      this.earnings.value = this.service.simulateEarningsUpdate(this.earnings.value);
    }, 2000);
  }

  private stopEarningsSimulation(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  getRecentTrips() {
    return this.service.getRecentTrips();
  }

  getCurrentStats() {
    return this.service.getCurrentStats();
  }

  dispose(): void {
    this.stopEarningsSimulation();
    this.isOnline.value = false;
  }
}
