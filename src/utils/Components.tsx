import React, { ReactElement } from "react";
import { View } from "react-native";
import * as Theme from "./Theme";

export interface SpacerProps {
  tiny?: boolean;
  small?: boolean;
  medium?: boolean;
  large?: boolean;
  horz?: boolean;
}

export const Spacer = (props: SpacerProps): ReactElement => {
  let size = 0;
  if (props.tiny) {
    size = Theme.normalize(5);
  } else if (props.small) {
    size = Theme.normalize(10);
  } else if (props.medium) {
    size = Theme.normalize(15);
  } else {
    size = Theme.normalize(25);
  }

  return (
    <View
      style={props.horz ? { marginStart: size } : { marginTop: size }}
    ></View>
  );
};

export const Glue = ({ grow }: { grow?: number }): ReactElement => (
  // eslint-disable-next-line
  <View style={{ flex: grow ? grow : 10 }} />
);
