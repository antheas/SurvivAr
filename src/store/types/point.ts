export interface Location {
  lat: number;
  lon: number;
}

export enum PointType {
  AREA,
  WAIT,
  QR,
  COLLECT
}

export interface Point {
  type: PointType;
  name: string;
  desc: string;

  loc: Location;
  radius: number;
  completed: boolean;
}

export interface WaitPoint {
  type: PointType.WAIT;
  duration: number; // Seconds
}

export interface QrPoint {
  type: PointType.QR;
  qrData: string;
}

export interface CollectPoint {
  type: PointType.COLLECT;
  qrPoints: QrPoint[];
}

export interface AreaPoint {
  type: PointType.AREA;
  children: Point;
}

export interface PointRoot {
  lastUpdated: number;
  updatedLocation: Location;

  areas: AreaPoint[];
}
