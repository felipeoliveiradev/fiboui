import { signal, Signal } from 'fiboui';
import { PerformanceService } from '../Services/PerformanceService';

export class PerformanceViewModel {
  isOnline: Signal<boolean>;
  earnings: Signal<number>;
  sheetY: Signal<number>;

  private service: PerformanceService;
  private updateInterval: number | null = null;

  constructor(service: PerformanceService) {
    this.service = service;
    this.isOnline = signal(false);
    this.earnings = signal(0);
    this.sheetY = signal(0);
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
  }
}
