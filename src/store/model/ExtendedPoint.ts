/**
 * This class contains wrappers for points that come from the redux model,
 * in an attempt to make them easier to handle by components.
 */

import { Location, Point } from "../types";

export class ExtendedPoint implements Point {
  public id: string;
  public icon: string;

  public name: string;
  public desc: string;

  public loc: Location;
  public radius: number;

  public distance: number;

  public constructor(p: Point, distance: number) {
    this.id = p.id;
    this.icon = p.icon;
    this.name = p.name;
    this.desc = p.desc;
    this.loc = p.loc;
    this.radius = p.radius;
    this.distance = distance;
  }

  public get completed(): boolean {
    return false;
  }

  public get userWithin(): boolean {
    return this.distance > 0 && this.distance <= this.radius;
  }
}
