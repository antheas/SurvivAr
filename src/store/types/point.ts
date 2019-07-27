export interface Location {
  lat: number;
  lon: number;
}

export interface Point {
  id: number;

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
  children: Point;
}

export interface PointRoot {
  lastUpdated: number;
  updatedLocation: Location;

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
