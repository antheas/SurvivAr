import Geolocation from "react-native-geolocation-service";
import LocationManagerInterface, {
  PositionCallback
} from "./LocationInterface";
import { PointEvent } from "../../store/types";
import { WaitProgressUpdate } from "../../store/actions";

export class LocationManager implements LocationManagerInterface {
  private watchId = -1;
  private callback: PositionCallback;

  public LocationManager() {
    this.callback = () => {
      //noop
    };
  }

  public get supportsBackgroundTracking() {
    return false;
  }

  public registerJsCallbacks(position: PositionCallback) {
    this.callback = position;
  }

  public startJsCallbacks() {
    if (this.watchId !== -1) throw Error("callbacks already enabled");

    this.watchId = Geolocation.watchPosition(
      (pos): void => {
        this.callback({
          coords: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          },
          accuracy: pos.coords.accuracy,
          updated: +pos.timestamp,
          valid: true
        });
      },
      undefined,
      {
        timeout: 500,
        maximumAge: 0,
        enableHighAccuracy: true,
        distanceFilter: 0
      }
    );
  }

  public stopJsCallbacks() {
    if (this.watchId === -1) return;
    Geolocation.clearWatch(this.watchId);
    this.watchId = -1;
  }

  public unregisterJsCallbacks() {
    this.stopJsCallbacks();
    this.callback = () => {
      //noop
    };
  }

  public updateClosestDistance(distance: number) {
    // noopO
  }

  public enableBackgroundTracking() {
    // noop
  }

  public async stopAndRetrieveProgress(): Promise<WaitProgressUpdate[]> {
    return [];
  }
}

export default LocationManager;
