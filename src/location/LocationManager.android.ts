import { PointEvent } from "../store/types";
import LocationManagerInterface, {
  PositionCallback
} from "./LocationInterface";
import { NativeModules } from "react-native";

const NativeLocationManager = NativeModules.NativeLocationManager;

export class LocationManager implements LocationManagerInterface {
  private watchId = -1;

  public get supportsBackgroundTracking() {
    return false;
  }

  public get supportsHeading() {
    return false;
  }

  public startJsCallbacks(callback: PositionCallback) {
    setInterval(
      () =>
        callback({
          coords: {
            lat: 37.948018,
            lon: 23.650656
          },
          accuracy: 25,
          updated: Date.now(),
          valid: true
        }),
      2000
    );
  }

  public stopJsCallbacks() {
    NativeLocationManager.testService();
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
