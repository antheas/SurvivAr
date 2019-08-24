import { Vibration, Platform } from "react-native";

const PATTERN_SUCCESS = 200;
const PATTERN_FAIL = [0, 200, 150, 200];
const PATTERN_FAIL_IOS = [0, 250];

export function notifyQrScanned(success: boolean) {
  if (success) {
    Vibration.vibrate(PATTERN_SUCCESS);
  } else {
    if (Platform.OS === "android") {
      Vibration.vibrate(PATTERN_FAIL);
    } else {
      // On iOS we cannot set vibration length, only pauses
      Vibration.vibrate(PATTERN_FAIL_IOS);
    }
  }
}
