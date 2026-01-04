import { Signal, Store, container, SignalType } from 'fiboui';
import { PerformanceService } from '../Services/PerformanceService';

@Store()
export class PerformanceViewModel {
  // Signal properties - automatically converted to signals
  @Signal(false)
  isOnline!: SignalType<boolean>;

  @Signal(0)
  earnings!: SignalType<number>;

  @Signal(0)
  sheetY!: SignalType<number>;

  public service: PerformanceService;
  private updateInterval: number | null = null;

  constructor() {
    this.service = container.resolve(PerformanceService);
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
