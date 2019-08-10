import Geolocation from "react-native-geolocation-service";
import { PointEvent } from "../store/types";
import LocationManagerInterface, {
  LocationCallback
} from "./LocationInterface";

function startJsCallbacks(callback: LocationCallback): void {
  Geolocation.watchPosition(
    (pos): void => {
      callback({
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

function stopJsCallbacks(): void {
  Geolocation.stopObserving();
}

const LocationManager: LocationManagerInterface = {
  startJsCallbacks,
  stopJsCallbacks,
  enableBackgroundTracking: (): void => undefined,
  disableBackgroundTracking: (): void => undefined,
  loadBackgroundEvents: (): Promise<PointEvent[]> =>
    new Promise((): PointEvent[] => []),
  supportsBackgroundTracking: false
};

export default LocationManager;
