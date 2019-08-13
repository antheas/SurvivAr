import { PointEvent } from "../../store/types";
import LocationManagerInterface, {
  PositionCallback
} from "./LocationInterface";
import {
  NativeModules,
  DeviceEventEmitter,
  EmitterSubscription
} from "react-native";

const NativeLocationManager = NativeModules.NativeLocationManager;

export class LocationManager implements LocationManagerInterface {
  private subPosition?: EmitterSubscription;

  public get supportsBackgroundTracking() {
    return false;
  }

  public registerJsCallbacks(callback: PositionCallback) {
    // TODO: Make sure WritableMap maps 1-1 to state objects
    this.subPosition = DeviceEventEmitter.addListener(
      NativeLocationManager.POSITION_EVENT,
      callback
    );
  }

  public unregisterJsCallbacks() {
    this.stopJsCallbacks();

    if (this.subPosition) {
      this.subPosition.remove();
      this.subPosition = undefined;
    }
  }

  public startJsCallbacks() {
    NativeLocationManager.enablePositionCallback();
  }

  public stopJsCallbacks() {
    NativeLocationManager.disablePositionCallback();
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
