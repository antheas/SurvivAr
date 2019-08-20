import { Vibration, Platform } from "react-native";

export enum EventType {
  ON_ENTER,
  ON_EXIT,
  ON_COMPLETE
}

const PATTERN_ON_ENTER = 400;
const PATTERN_ON_EXIT = 600;
const PATTERN_ON_COMPLETE_ANDROID = [0, 400, 250, 400];
const PATTERN_ON_COMPETE_IOS = [0, 250];

export function handlePointEvent(event: EventType) {
  switch (event) {
    case EventType.ON_ENTER:
      Vibration.vibrate(PATTERN_ON_ENTER);
      break;
    case EventType.ON_EXIT:
      Vibration.vibrate(PATTERN_ON_EXIT);
      break;
    case EventType.ON_COMPLETE:
      if (Platform.OS === "android") {
        Vibration.vibrate(PATTERN_ON_COMPLETE_ANDROID);
      } else {
        // On iOS we cannot set vibration length, only pauses
        Vibration.vibrate(PATTERN_ON_COMPETE_IOS);
      }
  }
}
