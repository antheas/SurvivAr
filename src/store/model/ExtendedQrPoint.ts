import { QrPointProgress, QrPoint } from "../types";
import { ExtendedPoint } from "./ExtendedPoint";
export class ExtendedQrPoint extends ExtendedPoint implements QrPoint {
  public qrData: {
    type: string;
    data: string;
  };
  public completed: boolean;

  public constructor(p: QrPoint, progress?: QrPointProgress) {
    super(p, -1);
    this.qrData = p.qrData;
    this.completed = progress ? progress.completed : false;

    // Set optional x, y
    if (
      typeof this.loc.x === "undefined" ||
      typeof this.loc.y === "undefined"
    ) {
      this.loc.x = 0;
      this.loc.y = 0;
    }
  }
}
