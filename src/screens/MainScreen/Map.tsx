import React from "react";
import { StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from "react-native-maps";
import { JSXElement } from "@babel/types";

import { PositionState } from "../../store/types";
import * as Theme from "../../utils/Theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const s = StyleSheet.create({
  map: {
    flex: 1
  }
});

export default class Map extends React.Component<{ position: PositionState }> {
  public render(): JSXElement {
    const pos = this.props.position;

    const userCoords = {
      latitude: pos.coords.lat,
      longitude: pos.coords.lon
    };

    return (
      <MapView
        style={s.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={Theme.mapStyle}
        region={{
          ...userCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
      >
        {pos.accuracy > 20 ? (
          <Circle
            center={userCoords}
            radius={pos.accuracy}
            {...Theme.map.circle.user}
          />
        ) : null}
        <Marker coordinate={userCoords} {...Theme.map.marker.user.marker}>
          <Icon {...Theme.map.marker.user.icon} />
        </Marker>
      </MapView>
    );
  }
}
