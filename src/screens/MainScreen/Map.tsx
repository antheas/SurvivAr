import React, { Fragment, ReactElement } from "react";
import { Platform, View } from "react-native";
import MapView, {
  AnimatedRegion,
  Circle,
  Marker,
  MarkerAnimated,
  PROVIDER_GOOGLE,
  Region
} from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  AreaPoint,
  Location,
  PositionState,
  HeadingState
} from "../../store/types";
import coordinateDeltas from "../../utils/coordinateDeltas";
import * as Theme from "../../utils/Theme";
import { ExtendedPoint } from "../../store/model/ExtendedPoint";
import MapButtons, { ZoomState } from "./MapButtons";

const NEARBY_RATIO = 3;
const ANIMATION_DELAY = 900;
const GREECE_COORDS: Region = {
  latitude: 39.282502,
  longitude: 22.61817,
  latitudeDelta: 20,
  longitudeDelta: 15
};
const DEFAULT_ZOOM = {
  latitudeDelta: 0.035,
  longitudeDelta: 0.02
};

function convertCoords(coords: Location) {
  return {
    latitude: coords.lat,
    longitude: coords.lon
  };
}

function isPointClose(point: ExtendedPoint) {
  return point.distance <= NEARBY_RATIO * point.radius;
}

const AreaMarker = (a: AreaPoint): ReactElement => {
  const coords = convertCoords(a.loc);
  return (
    <Fragment key={a.id}>
      <Circle center={coords} radius={a.radius} {...Theme.map.area.circle} />
      <Marker
        coordinate={coords}
        tracksViewChanges={false}
        {...Theme.map.area.marker}
      >
        <Icon {...Theme.map.area.icon} />
      </Marker>
    </Fragment>
  );
};

const PointMarker = (point: ExtendedPoint) => {
  let theme;
  let circle;
  if (point.completed) {
    theme = Theme.map.point.completed;
  } else if (point.userWithin) {
    theme = Theme.map.point.active;
    circle = theme.circle;
  } else if (isPointClose(point)) {
    theme = Theme.map.point.nearby;
    circle = theme.circle;
  } else {
    theme = Theme.map.point.default;
  }

  const coords = convertCoords(point.loc);

  return (
    <Fragment key={point.id}>
      {circle ? (
        <Circle center={coords} radius={point.radius} {...circle} />
      ) : null}
      <Marker coordinate={coords} tracksViewChanges={false} {...theme.marker}>
        <Icon name={point.icon} {...theme.icon} />
      </Marker>
    </Fragment>
  );
};

enum ZoomLevel {
  CLOSEST_POINT,
  CLOSEST_POINTS,
  AREA_POINTS
}

export interface IMapProps {
  position: PositionState;
  heading: HeadingState;
  areas: AreaPoint[];
  points: ExtendedPoint[]; // Sorted by distance

  syncEnabled: boolean;
  loading: boolean;

  onSyncToggled: () => void;
}

interface IMapState {
  coordinate: AnimatedRegion;
  zoomLevel: ZoomLevel;
  userTracked: boolean;
  headingTracked: boolean;
  mapIsAnimating: boolean;
}

export default class Map extends React.Component<IMapProps, IMapState> {
  public state = {
    coordinate: new AnimatedRegion(GREECE_COORDS),
    zoomLevel: ZoomLevel.AREA_POINTS,
    userTracked: true,
    headingTracked: true
  };
  private userMarker?: MarkerAnimated;
  private map?: MapView;

  public componentDidMount() {
    // Set marker to previous position, if it is valid
    if (!this.props.position.valid) return;
    this.state.coordinate.setValue({
      ...convertCoords(this.props.position.coords),
      ...DEFAULT_ZOOM
    });
  }

  public componentDidUpdate() {
    if (!this.props.position.valid) return;

    // Handle Marker
    const { coordinate } = this.state;
    const newCoords = convertCoords(this.props.position.coords);

    if (Platform.OS === "android") {
      if (this.userMarker) {
        // @ts-ignore
        this.userMarker._component.animateMarkerToCoordinate(
          newCoords,
          ANIMATION_DELAY
        );
      }
    } else {
      coordinate.timing(newCoords).start();
    }

    // Handle Map
    this.animateMap();
  }

  public render() {
    const pos = this.props.position;
    const userCoords = convertCoords(pos.coords);

    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          ref={(el: MapView) => (this.map = el)}
          provider={PROVIDER_GOOGLE}
          customMapStyle={Theme.mapStyle}
          initialRegion={GREECE_COORDS}
          onPanDrag={this.mapMoved}
        >
          {/* Area Points */}
          {this.props.areas.map(AreaMarker)}
          {/* Points */}
          {this.props.points.map(PointMarker)}
          {/* User Marker */}
          {pos.accuracy > 20 ? (
            <Circle
              center={userCoords}
              radius={pos.accuracy}
              {...Theme.map.user.circle}
            />
          ) : null}
          <MarkerAnimated
            ref={(marker: MarkerAnimated) => (this.userMarker = marker)}
            coordinate={this.state.coordinate}
            {...Theme.map.user.marker}
          >
            <Icon {...Theme.map.user.icon} />
          </MarkerAnimated>
        </MapView>
        <View style={Theme.map.button.styles.base.container}>
          <MapButtons
            zoomState={this.getZoomState()}
            headingTracked={this.state.headingTracked}
            headingSupport={false}
            syncEnabled={this.props.syncEnabled}
            hidden={this.props.loading}
            onZoomedIn={this.onZoomedIn}
            onZoomedOut={this.onZoomedOut}
            onCentered={this.onCentered}
            onSyncToggled={this.onSyncToggled}
            onHeadingToggled={this.onHeadingToggled}
          />
        </View>
      </View>
    );
  }

  private animateMap() {
    if (!this.map) return;
    if (!this.state.userTracked) return;

    // Default values
    const newCoords = convertCoords(this.props.position.coords);
    let region = {
      ...newCoords,
      ...DEFAULT_ZOOM
    };

    // Only use active points
    const points = this.props.points.filter(p => !p.completed);

    // Run only if there are points
    if (points.length) {
      // Find points that need to be included based on zoom
      let includedPoints: ExtendedPoint[];
      const sortedPoints = points.sort((a, b) => a.distance - b.distance);
      switch (this.state.zoomLevel) {
        case ZoomLevel.CLOSEST_POINTS:
          // Find closest points
          includedPoints = sortedPoints.filter(p => isPointClose(p));

          // If there are none fallback to 3 closest points
          if (!includedPoints.length) includedPoints = sortedPoints.slice(0, 3);
          break;
        case ZoomLevel.CLOSEST_POINT:
          includedPoints = sortedPoints.slice(0, 1);
          break;
        default:
          // ZoomLevel.AREA_POINTS
          includedPoints = points;
      }

      // Calculate new zoom only if there are points
      if (includedPoints.length) {
        region = coordinateDeltas(
          newCoords,
          includedPoints.map(({ loc }) => convertCoords(loc)),
          includedPoints[0].radius // Should be the closest one
        );
      }
    }

    // Animate
    this.map.animateToRegion(region, ANIMATION_DELAY);
    if (this.props.heading.valid) {
      this.map.animateCamera(
        {
          heading: this.props.heading.degrees
        },
        { duration: ANIMATION_DELAY }
      );
    }
  }

  private mapMoved = () => {
    if (this.state.userTracked) this.setState({ userTracked: false });
  };
  private getZoomState = () => {
    if (!this.state.userTracked) return ZoomState.NOT_CENTERED;

    switch (this.state.zoomLevel) {
      case ZoomLevel.CLOSEST_POINT:
        return ZoomState.ZOOMED_MAX;
      case ZoomLevel.AREA_POINTS:
        return ZoomState.ZOOMED_MIN;
      default:
        return ZoomState.CENTERED;
    }
  };
  private onZoomedIn = () => {
    if (!this.state.userTracked) return;

    switch (this.state.zoomLevel) {
      case ZoomLevel.CLOSEST_POINT:
        break;
      case ZoomLevel.CLOSEST_POINTS:
        this.setState({ zoomLevel: ZoomLevel.CLOSEST_POINT });
        break;
      case ZoomLevel.AREA_POINTS:
        this.setState({ zoomLevel: ZoomLevel.CLOSEST_POINTS });
        break;
      default:
        break;
    }
  };
  private onZoomedOut = () => {
    if (!this.state.userTracked) return;

    switch (this.state.zoomLevel) {
      case ZoomLevel.CLOSEST_POINT:
        this.setState({ zoomLevel: ZoomLevel.CLOSEST_POINTS });
        break;
      case ZoomLevel.CLOSEST_POINTS:
        this.setState({ zoomLevel: ZoomLevel.AREA_POINTS });
        break;
      case ZoomLevel.AREA_POINTS:
        break;
      default:
        break;
    }
  };
  private onCentered = () => {
    this.setState({ userTracked: true });
  };
  private onSyncToggled = () => {};
  private onHeadingToggled = () => {
    if (!this.state.userTracked) return;
    this.setState({ headingTracked: !this.state.headingTracked });
  };
}
