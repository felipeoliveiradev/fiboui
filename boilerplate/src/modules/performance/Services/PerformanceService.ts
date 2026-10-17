import { TripData, PerformanceStats } from '../Models/PerformanceData';

export class PerformanceService {
  getRecentTrips(): TripData[] {
    return [
      {
        id: '1',
        origin: 'Downtown',
        destination: 'Airport',
        duration: '28 min',
        distance: '15.2 mi',
        earnings: 42.50
      },
      {
        id: '2',
        origin: 'Marina',
        destination: 'Financial District',
        duration: '18 min',
        distance: '8.4 mi',
        earnings: 28.75
      },
      {
        id: '3',
        origin: 'Mission Bay',
        destination: 'SoMa',
        duration: '12 min',
        distance: '4.1 mi',
        earnings: 18.20
      }
    ];
  }

  getCurrentStats(): PerformanceStats {
    return {
      rating: 4.98,
      status: 'Platinum',
      totalEarnings: 0,
      tripsToday: 0
    };
  }

  simulateEarningsUpdate(currentEarnings: number): number {
    return currentEarnings + Math.random() * 5;
  }
}
