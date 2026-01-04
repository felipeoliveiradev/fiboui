export interface TripData {
  id: string;
  origin: string;
  destination: string;
  duration: string;
  distance: string;
  earnings: number;
}

export interface PerformanceStats {
  rating: number;
  status: 'Platinum' | 'Gold' | 'Silver';
  totalEarnings: number;
  tripsToday: number;
}
