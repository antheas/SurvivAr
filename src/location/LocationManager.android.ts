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

  public registerJsCallbacks(
    position: PositionCallback,
    heading?: HeadingCallback
  ) {
    // TODO: Make sure WritableMap maps 1-1 to state objects
    this.subPosition = DeviceEventEmitter.addListener(
      NativeLocationManager.POSITION_EVENT,
      position
    );
    if (heading) {
      this.subHeading = DeviceEventEmitter.addListener(
        NativeLocationManager.HEADING_EVENT,
        heading
      );
    }
  }

  public unregisterJsCallbacks() {
    this.stopJsCallbacks();

    if (this.subPosition) {
      this.subPosition.remove();
      this.subPosition = undefined;
    }
    if (this.subHeading) {
      this.subHeading.remove();
      this.subHeading = undefined;
    }
  }

  public startJsCallbacks() {
    NativeLocationManager.enablePositionCallback();
    if (this.subHeading) NativeLocationManager.enableHeadingCallback();
  }

  public stopJsCallbacks() {
    NativeLocationManager.disablePositionCallback();
    NativeLocationManager.disableHeadingCallback();
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
