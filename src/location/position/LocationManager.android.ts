import {
  DeviceEventEmitter,
  EmitterSubscription,
  NativeModules
} from "react-native";
import { WaitProgressUpdate } from "../../store/actions";
import { ExtendedPoint } from "../../store/model/ExtendedPoint";
import LocationManagerInterface, {
  PositionCallback
} from "./LocationInterface";
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

  public updateClosestDistance(distance: number) {
    NativeLocationManager.setClosestPointDistance(distance);
  }

  public enableBackgroundTracking(points: ExtendedPoint[]) {
    NativeLocationManager.enableBackgroundTracking(points);
  }

  public disableBackgroundTracking() {
    NativeLocationManager.disableBackgroundTracking();
  }

  public async loadBackgroundEvents(): Promise<WaitProgressUpdate[]> {
    const rawProgress: Array<{
      id: string;
      progress: number;
    }> = await NativeLocationManager.retrieveBackgroundProgress();

    return rawProgress.map(
      (p): WaitProgressUpdate => ({
        id: p.id,
        progress: { elapsedTime: p.progress }
      })
    );
  }
}

export default LocationManager;
