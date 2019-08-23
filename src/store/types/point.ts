export interface Location {
  lat: number;
  lon: number;

  x?: number;
  y?: number;
}

export interface Point {
  id: string;
  icon: string;

  name: string;
  desc: string;

  loc: Location;
  radius: number;
}

export interface WaitPoint extends Point {
  duration: number; // Seconds
}

export interface QrPoint extends Point {
  qrData: {
    type: string;
    data: string;
  };
}

export interface CollectPoint extends Point {
  image: any;
  qrPoints: QrPoint[];
}

export interface AreaPoint extends Point {
  children: string[];
}

export const POINT_DATA_STALE_AFTER_DAYS = 10;

export interface PointState {
  valid: boolean;
  updated: number;
  location: Location;
  bounds: number;

  areas: AreaPoint[];
  points: Record<string, Point>;
}

// Guards
export function isWaitPoint(point: Point): point is WaitPoint {
  return "duration" in point;
}

export function isQrPoint(point: Point): point is QrPoint {
  return "qrData" in point;
}

export function isCollectPoint(point: Point): point is CollectPoint {
  return "qrPoints" in point;
}
