import { PointProgress, WaitPoint } from "../types";
import { ExtendedPoint } from "./ExtendedPoint";

export class ExtendedWaitPoint extends ExtendedPoint implements WaitPoint {
  public duration: number;
  public completedDuration: number;

  public constructor(p: WaitPoint, distance: number, progress?: PointProgress) {
    super(p, distance);
    this.duration = p.duration;
    this.completedDuration = progress ? (progress.elapsedTime as number) : 0;
  }

  public get completed(): boolean {
    return this.completedDuration >= this.duration;
  }
}
