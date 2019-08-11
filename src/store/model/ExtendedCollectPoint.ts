import { CollectPoint, CollectPointProgress } from "../types";
import { ExtendedPoint } from "./ExtendedPoint";
import { ExtendedQrPoint } from "./ExtendedQrPoint";

export class ExtendedCollectPoint extends ExtendedPoint
  implements CollectPoint {
  public qrPoints: ExtendedQrPoint[];
  public completedPoints: number;

  public constructor(
    p: CollectPoint,
    distance: number,
    progress: CollectPointProgress
  ) {
    super(p, distance);
    // setup qr points
    this.qrPoints = p.qrPoints.map(
      qr => new ExtendedQrPoint(qr, progress.qrPoints[qr.id])
    );
    // mark completed qr points
    this.completedPoints = 0;
    this.qrPoints.forEach((qr): void => {
      if (qr.completed) {
        this.completedPoints++;
      }
    });
  }

  public get totalPoints(): number {
    return this.qrPoints.length;
  }

  public get completed(): boolean {
    return this.completedPoints >= this.qrPoints.length;
  }
}
