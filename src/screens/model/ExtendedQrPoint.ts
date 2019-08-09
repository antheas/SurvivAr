import { PointProgress, QrPoint } from "../../store/types";
import { ExtendedPoint } from "./ExtendedPoint";
export class ExtendedQrPoint extends ExtendedPoint implements QrPoint {
  public qrData: string;
  public completed: boolean;

  public constructor(p: QrPoint, progress?: PointProgress) {
    super(p, -1);
    this.qrData = p.qrData;
    this.completed = progress ? (progress.completed as boolean) : false;
  }
}
