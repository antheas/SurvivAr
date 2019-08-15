import { Dimensions, Platform } from "react-native";
import MapView, { Camera, MarkerAnimated } from "react-native-maps";
import {
  DEFAULT_HEADING,
  Heading
} from "../../../location/heading/HeadingInterface";
import HeadingManager from "../../../location/heading/HeadingManager";
import { ExtendedPoint } from "../../../store/model/ExtendedPoint";
import { Location } from "../../../store/types";
import coordinateDeltas from "../../../utils/coordinateDeltas";
import { convertCoords, isPointClose } from "./Utils";

export const ANIMATION_DELAY = 900;
const HEADING_DELAY = 300;

export const DEFAULT_ZOOM = {
  latitudeDelta: 0.035,
  longitudeDelta: 0.02
};

const DEFAULT_ZOOM_NUM = 12;

const minWidth = Math.round(
  Math.min(Dimensions.get("window").width, Dimensions.get("window").height)
);

// https://groups.google.com/forum/#!topic/google-maps-js-api-v3/hDRO4oHVSeM
const zoomFromRadius = (c: Location, r: number, margin: number = -0.2) =>
  Math.log2(
    (156543.03392 * Math.cos((c.lat * Math.PI) / 180) * minWidth) /
      (2 * r * (margin + 1))
  );

export enum ZoomLevel {
  CLOSEST_POINT,
  CLOSEST_POINTS,
  AREA_POINTS
}

export type MapReference = () => {
  map?: MapView;
  coords: Location;
  points: ExtendedPoint[];
  userTracked: boolean;
  headingTracked: boolean;
  zoomLevel: ZoomLevel;
};

export default class CameraManager {
  public supported: boolean;
  private r: MapReference;
  private headingManager: HeadingManager;
  private heading: Heading;
  private enabled: boolean;

  public constructor(reference: MapReference) {
    this.headingManager = new HeadingManager();
    this.heading = DEFAULT_HEADING;
    this.r = reference;
    this.supported = this.headingManager.supported;
    this.enabled = false;
  }

  public registerCallbacks() {
    if (!this.supported) return;
    this.headingManager.registerJsCallbacks(this.onHeadingChanged);
  }

  public unregisterCallbacks() {
    if (!this.supported) return;
    this.headingManager.unregisterJsCallbacks();
  }

  public enable() {
    if (!this.supported) return;
    this.enabled = true;
    this.updateCallbackState();
  }

  public disable() {
    if (!this.supported) return;
    this.enabled = false;
    this.updateCallbackState();
  }

  public update() {
    this.updateCallbackState();

    if (this.supported && this.r().headingTracked) {
      this.animateWithHeading(false);
    } else {
      this.animateWithoutHeading();
    }
  }

  public onHeadingChanged = (h: Heading) => {
    this.heading = h;
    this.animateWithHeading(true);
  };

  private updateCallbackState() {
    if (this.r().headingTracked && this.enabled) {
      this.headingManager.startJsCallbacks();
    } else {
      this.headingManager.stopJsCallbacks();
    }
  }

  private findIncludedPoints(): ExtendedPoint[] {
    const points = this.r().points.filter(p => !p.completed);
    // If there are no points return.
    if (!points.length) return [];

    let includedPoints: ExtendedPoint[];

    const sortedPoints = points.sort((a, b) => a.distance - b.distance);
    switch (this.r().zoomLevel) {
      case ZoomLevel.CLOSEST_POINTS:
        // Find closest points
        includedPoints = sortedPoints.filter(p => isPointClose(p));

        // If there are none fallback to 3 closest points
        if (!includedPoints.length) includedPoints = sortedPoints.slice(0, 3);
        break;
      case ZoomLevel.CLOSEST_POINT:
        includedPoints = sortedPoints.slice(0, 1);
        break;
      default:
        // ZoomLevel.AREA_POINTS
        includedPoints = points;
    }

    return includedPoints;
  }

  private animateWithoutHeading() {
    const map = this.r().map;
    if (!map) return;
    if (!this.r().userTracked) return;

    // Default values
    const newCoords = convertCoords(this.r().coords);
    let region = {
      ...newCoords,
      ...DEFAULT_ZOOM
    };

    const includedPoints = this.findIncludedPoints();

    // Calculate new zoom only if there are points
    if (includedPoints.length) {
      region = coordinateDeltas(
        newCoords,
        includedPoints.map(({ loc }) => convertCoords(loc)),
        includedPoints[0].radius // Should be the closest one
      );
    }

    // Animate
    map.animateToRegion(region, ANIMATION_DELAY);
  }

  private animateWithHeading(headingChanged: boolean) {
    const map = this.r().map;
    if (!map) return;
    if (!this.r().userTracked) return;

    // Check if there is a heading, iOS is not supported with heading.
    if (!this.heading.valid || Platform.OS === "ios") {
      this.animateWithoutHeading();
      return;
    }

    // Create default camera
    const camera: Partial<Camera> = {
      center: convertCoords(this.r().coords),
      heading: this.heading.degrees,
      zoom: DEFAULT_ZOOM_NUM
    };

    const includedPoints = this.findIncludedPoints();

    // Calculate new zoom only if there are points
    if (includedPoints.length) {
      const maxDistance = includedPoints
        .map(p => p.distance)
        .sort((a, b) => b - a)[0];

      camera.zoom = zoomFromRadius(this.r().coords, maxDistance);
    }

    const delay = headingChanged ? HEADING_DELAY : ANIMATION_DELAY;
    map.animateCamera(camera, { duration: delay });
  }
}
