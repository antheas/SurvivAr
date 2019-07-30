import React from "react";
import Geolocation from "react-native-geolocation-service";
import LocationManagerInterface from "./LocationInterface";
import { NavigationState } from "../store/types";

//
function startJsCallbacks(callback: LocationCallback): void {
  Geolocation.watchPosition(
    (pos): NavigationState => {
      callback({
        currentLocation: {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        },
        accuracy: pos.coords.accuracy,
        lastUpdate: +pos.timestamp,
        valid: true
      });
    },
    null,
    {
      timeout: 5000,
      maximumAge: 20000,
      enableHighAccuracy: true,
      distanceFilter: 0
    }
  );
}

function stopJsCallbacks(): void {
  Geolocation.stopObserving();
}

const LocationManager: LocationManagerInterface = {
  startJsCallbacks: startJsCallbacks,
  stopJsCallbacks: stopJsCallbacks,
  enableBackgroundTracking: (): void => undefined,
  disableBackgroundTracking: (): void => undefined,
  loadBackgroundEvents: (): Promise<PointEvent[]> =>
    new Promise((): void => []),
  supportsBackgroundTracking: false
};

export default LocationManager;
