import { PointEvent } from "../store/types";
import LocationManagerInterface, {
  PositionCallback,
  HeadingCallback
} from "./LocationInterface";
import {
  NativeModules,
  DeviceEventEmitter,
  EmitterSubscription
} from "react-native";

const NativeLocationManager = NativeModules.NativeLocationManager;

export class LocationManager implements LocationManagerInterface {
  private subPosition?: EmitterSubscription;
  private subHeading?: EmitterSubscription;

  public get supportsBackgroundTracking() {
    return false;
  }

  public startJsCallbacks(
    callback: PositionCallback,
    heading?: HeadingCallback
  ) {
    // TODO: Make sure WritableMap maps 1-1 to state objects
    this.subPosition = DeviceEventEmitter.addListener(
      NativeLocationManager.POSITION_EVENT,
      callback
    );
    NativeLocationManager.enablePositionCallback();

    if (heading) {
      this.subHeading = DeviceEventEmitter.addListener(
        NativeLocationManager.HEADING_EVENT,
        callback
      );
      NativeLocationManager.enableHeadingCallback();
    }
  }

  public stopJsCallbacks() {
    NativeLocationManager.disablePositionCallback();
    NativeLocationManager.disableHeadingCallback();

    if (this.subPosition) this.subPosition.remove();
    if (this.subHeading) this.subHeading.remove();
  }

  public enableBackgroundTracking() {
    // noop
  }

  public disableBackgroundTracking() {
    // noop
  }

  public async loadBackgroundEvents(): Promise<PointEvent[]> {
    return [] as PointEvent[];
  }
}

export default LocationManager;
