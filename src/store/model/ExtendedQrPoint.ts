import { QrPointProgress, QrPoint } from "../types";
import { ExtendedPoint } from "./ExtendedPoint";
export class ExtendedQrPoint extends ExtendedPoint implements QrPoint {
  public qrData: {
    type: string;
    data: string;
  };
  private progress?: QrPointProgress;

  public constructor(p: QrPoint, progress?: QrPointProgress) {
    super(p, -1);
    this.qrData = p.qrData;
    this.progress = progress;

    // Set optional x, y
    if (
      typeof this.loc.x === "undefined" ||
      typeof this.loc.y === "undefined"
    ) {
      this.loc.x = -1;
      this.loc.y = -1;
    }
  }

  public get completed(): boolean {
    return this.progress ? this.progress.completed : false;
  }
}
