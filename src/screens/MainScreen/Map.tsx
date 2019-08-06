import React, { Fragment } from "react";
import { StyleSheet } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Circle,
  Marker,
  LatLng
} from "react-native-maps";
import { JSXElement } from "@babel/types";

import {
  PositionState,
  AreaPoint,
  QrPoint,
  WaitPoint,
  Point,
  Location
} from "../../store/types";
import * as Theme from "../../utils/Theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const s = StyleSheet.create({
  map: {
    flex: 1
  }
});

export interface MapInterface {
  position: PositionState;
  areas: AreaPoint[];
  currentArea?: AreaPoint;
  currentPoint?: QrPoint | WaitPoint;
}

export default class Map extends React.Component<MapInterface> {
  private convertCoords(coords: Location): LatLng {
    return {
      latitude: coords.lat,
      longitude: coords.lon
    };
  }

  public render(): JSXElement {
    const pos = this.props.position.coords;
    const userCoords = this.convertCoords(pos);

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
        {/* Area Points */}
        {this.props.areas.map(
          (a: AreaPoint): JSXElement => {
            let coords = this.convertCoords(a.loc);
            return (
              <Fragment key={a.id}>
                <Circle
                  center={coords}
                  radius={a.radius}
                  {...Theme.map.area.circle}
                />
                <Marker coordinate={coords} {...Theme.map.area.marker}>
                  <Icon {...Theme.map.area.icon} />
                </Marker>
              </Fragment>
            );
          }
        )}
        {this.props.currentArea
          ? this.props.currentArea.children.map(
              (p: Point): JSXElement => {
                let coords = this.convertCoords(p.loc);

                return (
                  <Fragment key={p.id}>
                    <Circle
                      center={coords}
                      radius={p.radius}
                      {...Theme.map.point.circle}
                    />
                    <Marker coordinate={coords} {...Theme.map.point.marker}>
                      <Icon {...Theme.map.point.icon} icon={p.icon} />
                    </Marker>
                  </Fragment>
                );
              }
            )
          : null}
        {/* User Marker */}
        {pos.accuracy > 20 ? (
          <Circle
            center={userCoords}
            radius={pos.accuracy}
            {...Theme.map.user.circle}
          />
        ) : null}
        <Marker coordinate={userCoords} {...Theme.map.user.marker}>
          <Icon {...Theme.map.user.icon} />
        </Marker>
      </MapView>
    );
  }
}
