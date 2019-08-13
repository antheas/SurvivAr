import HeadingManagerInterface, { HeadingCallback } from "./HeadingInterface";
import {
  EmitterSubscription,
  NativeModules,
  DeviceEventEmitter
} from "react-native";

const NativeLocationManager = NativeModules.NativeLocationManager;

export default class HeadingManager implements HeadingManagerInterface {
  private subHeading?: EmitterSubscription;

  public get supported() {
    return true;
  }

  public registerJsCallbacks(callback: HeadingCallback) {
    // TODO: Make sure WritableMap maps 1-1 to state objects
    this.subHeading = DeviceEventEmitter.addListener(
      NativeLocationManager.HEADING_EVENT,
      callback
    );
  }

  public unregisterJsCallbacks() {
    this.stopJsCallbacks();

    if (this.subHeading) {
      this.subHeading.remove();
      this.subHeading = undefined;
    }
  }

  public startJsCallbacks() {
    NativeLocationManager.enableHeadingCallback();
  }

  public stopJsCallbacks() {
    NativeLocationManager.disableHeadingCallback();
  }
}
