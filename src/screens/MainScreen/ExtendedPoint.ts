/**
 * This class contains wrappers for points that come from the redux model,
 * in an attempt to make them easier to handle by components.
 */

import {
  Point,
  WaitPoint,
  PointProgress,
  CollectPoint,
  QrPoint
} from "../../store/types";

export class ExtendedPoint implements Point {
  public constructor(p: Point, distance: number) {
    this.id = p.id;
    this.icon = p.icon;
    this.name = p.name;
    this.desc = p.desc;
    this.loc = p.loc;
    this.radius = p.radius;
    this.distance = distance;
  }

  public id: string;
  public icon: string;

  public name: string;
  public desc: string;

  public loc: Location;
  public radius: number;

  public distance: number;

  public get completed(): boolean {
    return false;
  }

  public get userWithin(): boolean {
    return this.distance > 0 && this.distance <= this.radius;
  }
}

export class ExtendedWaitPoint extends ExtendedPoint implements WaitPoint {
  public constructor(p: WaitPoint, distance: number, progress?: PointProgress) {
    super(p, distance);

    this.duration = p.duration;
    this.elapsedTime = progress ? progress.elapsedTime : 0;
  }

  public duration: number;
  public completedDuration: number;

  public get completed(): boolean {
    return this.completedDuration >= this.duration;
  }
}

export class ExtendedQrPoint extends ExtendedPoint implements QrPoint {
  public constructor(p: QrPoint, progress?: PointProgress) {
    super(p, -1);

    this.completed = progress.completed;
  }

  public completed: boolean;
}

export class ExtendedCollectPoint extends ExtendedPoint
  implements CollectPoint {
  public constructor(
    p: CollectPoint,
    distance: number,
    progress: Map<string, PointProgress>
  ) {
    super(p, distance);

    // setup qr points
    this.qrPoints = p.qrPoints.map(
      (qr): ExtendedQrPoint => new ExtendedQrPoint(qr, progress[qr.id])
    );

    // mark completed qr points
    this.completedPoints = 0;
    this.qrPoints.forEach((qr): void => {
      if (qr.completed) this.completedPoints++;
    });
  }

  public qrPoints: ExtendedQrPoint[];

  public completedPoints: number;

  public get completed(): boolean {
    return this.completedPoints >= this.qrPoints.length;
  }
}
