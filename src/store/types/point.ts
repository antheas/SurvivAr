export interface Location {
  lat: number;
  lon: number;
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
  qrData: string;
}

export interface CollectPoint extends Point {
  qrPoints: QrPoint[];
}

export interface AreaPoint extends Point {
  children: Point[];
}

export const POINT_DATA_STALE_AFTER_DAYS = 10;

export interface PointState {
  valid: boolean;
  updated: number;
  location: Location;
  bounds: number;

  areas: AreaPoint[];
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

export interface PointEvent {
  duration: number;
  start: Date;
  end: Date;
}
