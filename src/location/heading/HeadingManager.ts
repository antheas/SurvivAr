import HeadingManagerInterface, {
  HeadingCallback,
  DEFAULT_HEADING
} from "./HeadingInterface";

export default class HeadingManager implements HeadingManagerInterface {
  public get supported() {
    return false;
  }

  public registerJsCallbacks(callback: HeadingCallback) {
    callback(DEFAULT_HEADING);
  }

  public unregisterJsCallbacks() {
    // noop
  }

  public startJsCallbacks() {
    // noop
  }

  public stopJsCallbacks() {
    // noop
  }
}
