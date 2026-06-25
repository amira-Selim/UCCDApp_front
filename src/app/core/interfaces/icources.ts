export interface Icources {

  id: number;
  name: string;
  startDate: string;
  duration: number;
  capacity: number;
  price: number;
  certificationFee: number;
  type: string;

  pendingCount?: number;
}