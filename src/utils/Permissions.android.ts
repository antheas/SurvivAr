import { PermissionsAndroid } from "react-native"; // eslint-disable-line

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
  }
  return false;
}

export async function checkLocationPermission(): Promise<boolean> {
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted;
  } catch (err) {
    console.warn(err);
  }
  return false;
}
