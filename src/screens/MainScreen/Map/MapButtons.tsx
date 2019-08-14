import React, { FunctionComponent } from "react";
import { TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Theme from "../../../utils/Theme";

interface IMapButton {
  icon: string;
  active?: boolean;
  disabled?: boolean;
  hidden?: boolean;

  onPress?: () => void;
}

const MapButton: FunctionComponent<IMapButton> = ({
  icon,
  active,
  disabled,
  hidden,
  onPress
}) => {
  if (hidden) return null;

  const styles = Theme.map.button.styles;
  let iconStyle;
  let viewStyle;
  if (active && disabled) {
    iconStyle = styles.icon.disabledActive;
    viewStyle = styles.view.disabledActive;
  } else if (active) {
    iconStyle = styles.icon.active;
    viewStyle = styles.view.active;
  } else if (disabled) {
    iconStyle = styles.icon.disabled;
    viewStyle = styles.view.disabled;
  } else {
    iconStyle = styles.icon.enabled;
    viewStyle = styles.view.enabled;
  }

  viewStyle = {
    ...viewStyle,
    ...styles.base.view
  };

  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}>
      <View style={viewStyle}>
        <Icon name={icon} style={iconStyle} {...Theme.map.button.icon} />
      </View>
    </TouchableOpacity>
  );
};

export enum ZoomState {
  ZOOMED_MIN,
  ZOOMED_MAX,
  CENTERED,
  NOT_CENTERED
}

export interface IMapButtons {
  zoomState: ZoomState;
  headingTracked: boolean;
  headingSupport: boolean;
  syncEnabled: boolean;
  hidden: boolean;

  onZoomedIn: () => void;
  onZoomedOut: () => void;
  onCentered: () => void;
  onSyncToggled: () => void;
  onHeadingToggled: () => void;
}

const MapButtons: FunctionComponent<IMapButtons> = props => {
  if (props.hidden) return null;

  return (
    <View>
      <MapButton
        icon="plus"
        disabled={props.zoomState === ZoomState.ZOOMED_MAX}
        hidden={props.zoomState === ZoomState.NOT_CENTERED}
        onPress={props.onZoomedIn}
      />
      <MapButton
        icon="minus"
        disabled={props.zoomState === ZoomState.ZOOMED_MIN}
        hidden={props.zoomState === ZoomState.NOT_CENTERED}
        onPress={props.onZoomedOut}
      />
      <MapButton
        icon={props.headingTracked ? "compass-outline" : "compass-off-outline"}
        active={props.headingTracked}
        hidden={
          props.zoomState === ZoomState.NOT_CENTERED || !props.headingSupport
        }
        onPress={props.onHeadingToggled}
      />
      <MapButton
        icon="crosshairs-gps"
        hidden={props.zoomState !== ZoomState.NOT_CENTERED}
        onPress={props.onCentered}
      />
      <MapButton
        icon="sync-alert"
        active={props.syncEnabled}
        onPress={props.onSyncToggled}
      />
    </View>
  );
};

export default MapButtons;
