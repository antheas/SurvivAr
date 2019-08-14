import React from "react";
import { AppState, Platform, View } from "react-native";
import MapView, {
  AnimatedRegion,
  Circle,
  MarkerAnimated,
  PROVIDER_GOOGLE,
  Region
} from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ExtendedPoint } from "../../../store/model/ExtendedPoint";
import { AreaPoint, PositionState } from "../../../store/types";
import * as Theme from "../../../utils/Theme";
import AreaMarker from "./AreaMarker";
import CameraManager, {
  ANIMATION_DELAY,
  DEFAULT_ZOOM,
  ZoomLevel
} from "./CameraManager";
import MapButtons, { ZoomState } from "./MapButtons";
import PointMarker from "./PointMarker";
import { convertCoords } from "./Utils";

const GREECE_COORDS: Region = {
  latitude: 39.282502,
  longitude: 22.61817,
  latitudeDelta: 20,
  longitudeDelta: 15
};

export interface IMapProps {
  position: PositionState;
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
}

export default class Map extends React.Component<IMapProps, IMapState> {
  public state = {
    coordinate: new AnimatedRegion(GREECE_COORDS),
    zoomLevel: ZoomLevel.AREA_POINTS,
    userTracked: true,
    headingTracked: false
  };
  private map?: MapView;
  private userMarker?: MarkerAnimated;
  private cameraManager = new CameraManager(() => ({
    map: this.map,
    coords: this.props.position.coords,
    points: this.props.points,
    userTracked: this.state.userTracked,
    headingTracked: this.state.headingTracked,
    zoomLevel: this.state.zoomLevel
  }));

  public componentDidMount() {
    // Set marker to previous position, if it is valid
    if (!this.props.position.valid) return;
    this.state.coordinate.setValue({
      ...convertCoords(this.props.position.coords),
      ...DEFAULT_ZOOM
    });

    // Manage Map animation
    this.cameraManager.registerCallbacks();
    this.cameraManager.enable();

    AppState.addEventListener("change", s => {
      if (s === "active") {
        this.cameraManager.enable();
      } else {
        this.cameraManager.enable();
      }
    });
  }

  public componentWillUnmount() {
    this.cameraManager.unregisterCallbacks();
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
    this.cameraManager.update();
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
            headingSupport={this.cameraManager.supported}
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

  private mapMoved = () => {
    if (!this.state.userTracked) return;
    this.setState({ userTracked: false });
    this.cameraManager.update();
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
    this.cameraManager.update();
  };
}
