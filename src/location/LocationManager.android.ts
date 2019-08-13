import { PointEvent } from "../store/types";
import LocationManagerInterface, {
  PositionCallback,
  HeadingCallback
} from "./LocationInterface";
import { NativeModules } from "react-native";

const NativeLocationManager = NativeModules.NativeLocationManager;

export class LocationManager implements LocationManagerInterface {
  public get supportsBackgroundTracking() {
    return false;
  }

  public startJsCallbacks(
    callback: PositionCallback,
    heading?: HeadingCallback
  ) {
    // TODO: Make sure WritableMap maps 1-1 to state objects
    NativeLocationManager.registerPositionCallback(callback);
    if (heading) {
      NativeLocationManager.registerHeadingCallback(callback);
    }
  }

  public stopJsCallbacks() {
    NativeLocationManager.unregisterPositionCallback();
    NativeLocationManager.unregisterHeadingCallback();
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
