import React, {
  Fragment,
  FunctionComponent,
  useState,
  useRef,
  MutableRefObject,
  useEffect
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  LayoutChangeEvent,
  ImageBackground
} from "react-native";
import { RNCamera } from "react-native-camera";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { completeQrPoint } from "../../store/actions";
import { ExtendedCollectPoint } from "../../store/model/ExtendedCollectPoint";
import { ExtendedQrPoint } from "../../store/model/ExtendedQrPoint";
import { selectExtendedCollectPoint } from "../../store/selectors";
import { State } from "../../store/types";
import { Spacer } from "../../utils/Components";
import * as Theme from "../../utils/Theme";
import { ellipsis } from "../../utils/Theme";
import getImage from "./LocalImage";

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end"
  },
  mapContainer: {
    flex: 3,
    width: "100%"
  },
  camera: {
    flex: 1,
    width: "100%",
    overflow: "hidden"
  },
  map: {
    flex: 1,
    marginTop: 12
  },
  mapIcon: {
    position: "absolute",
    fontSize: 15
  },
  headerContainer: {
    borderTopWidth: 3,
    borderTopColor: Theme.colors.accent,
    paddingTop: 12,
    borderBottomWidth: 3,
    borderBottomColor: Theme.colors.accent,
    paddingBottom: 12
  },
  header: {
    width: "100%",
    textAlign: "center",
    ...Theme.text.color.dark,
    ...Theme.text.size.header,
    marginBottom: 3
  },
  text: {
    width: "100%",
    ...Theme.text.color.light,
    ...Theme.text.size.medium,
    marginBottom: 12,
    textAlign: "center"
  },
  listContainer: {
    width: "100%",
    flex: 4
  },
  list: {
    width: "100%",
    marginHorizontal: 20,
    flex: 1
  },

  pointContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  pointIcon: {
    fontSize: 30
  },
  pointText: {
    ...Theme.text.size.medium
  },
  pointSubText: {
    ...Theme.text.size.small,
    ...Theme.text.color.light
  },

  buttonBackground: {
    backgroundColor: Theme.colors.primaryDark,
    width: "100%",
    height: Dimensions.get("window").height / 6
  },
  buttonForeground: {
    ...Theme.component.container.background,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    ...Theme.text.size.large,
    ...Theme.text.color.primary
  }
});

const QrPoint = ({ p }: { p: ExtendedQrPoint }) => {
  const styleColor = p.completed
    ? Theme.text.color.success
    : Theme.text.color.primaryColored;

  return (
    <View style={s.pointContainer}>
      <Icon name={p.icon} style={{ ...s.pointIcon, ...styleColor }} />
      <Spacer medium horz />
      <View>
        <Text style={{ ...s.pointText, ...styleColor }}>
          {ellipsis(p.name, 25)}
        </Text>
        <Text style={s.pointSubText}>{ellipsis(p.desc, 35)}</Text>
      </View>
    </View>
  );
};

const MapMarker = ({
  p,
  width,
  height
}: {
  p: ExtendedQrPoint;
  width: number;
  height: number;
}) => {
  const color = p.completed ? Theme.colors.disabledDark : Theme.colors.primary;
  // Check we have map metadata
  if (!p.loc.x || !p.loc.y) return null;

  return (
    <Icon
      name={p.icon}
      style={{
        ...s.mapIcon,
        color,
        top: height * p.loc.y + 12,
        left: width * p.loc.x
      }}
    />
  );
};

interface ICollectStateProps {
  point?: ExtendedCollectPoint;
}

interface ICollectDispatchProps {
  pointCompleted: (p: string) => void;
}

export interface ICollectOwnProps {
  navigation: NavigationScreenProp<any>;
}

export interface ICollectProps
  extends ICollectStateProps,
    ICollectDispatchProps,
    ICollectOwnProps {}

const CollectScreen: FunctionComponent<ICollectProps> = ({
  point,
  pointCompleted,
  navigation
}) => {
  // Check there is a valid point
  if (!point) {
    navigation.goBack();
    return null;
  }

  // Setup camera hooks
  const [cameraOpen, setCameraOpen] = useState(false);
  const switchToCamera = () => {
    setCameraOpen(!cameraOpen);
  };
  const qrRead = (type: string, data: string) => {
    const p = point.qrPoints.find(
      qr => !qr.completed && qr.qrData.data === data // && qr.qrData.type === type
    );

    // TODO: Handle error
    if (p) {
      pointCompleted(p.id);
    }
  };

  // Prepare map pointers
  const [[width, height], setDim] = useState([-1, -1]);
  const [[mapWidth, mapHeight], setMapDim] = useState([-1, -1]);
  const [[imgWidth, imgHeight], setImgDim] = useState([-1, -1]);

  useEffect(() => {
    if (
      mapWidth === -1 ||
      mapHeight === -1 ||
      imgWidth === -1 ||
      imgHeight === -1
    )
      return;

    let newHeight = height;
    let newWidth = width;
    if ((mapWidth * 1.0) / mapHeight > (imgWidth * 1.0) / imgHeight) {
      // Excess width
      newHeight = mapHeight;
      newWidth = mapHeight * ((imgWidth * 1.0) / imgHeight);
    } else {
      // Excess height
      newWidth = mapWidth;
      newHeight = mapWidth * ((imgHeight * 1.0) / imgWidth);
    }

    if (newWidth !== width || newHeight !== height)
      setDim([newWidth, newHeight]);
  }, [mapWidth, mapHeight, imgWidth, imgHeight]);

  const updateMapDims = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (mapWidth === w && mapHeight === h) return;
    setMapDim([w, h]);
  };

  const updateImgDims = (w: number, h: number) => {
    if (imgWidth === w && imgHeight === h) return;
    setImgDim([w, h]);
  };

  // Setup img size callbacks
  if (point.image.local) {
    const { width: w, height: h } = Image.resolveAssetSource(
      getImage(point.image.uri)
    );
    updateImgDims(w, h);
  } else {
    Image.getSize(point.image.uri, updateImgDims, () => {});
  }

  return (
    <View style={s.container}>
      {/* Map or camera container */}
      <View style={s.mapContainer}>
        {cameraOpen ? (
          <Fragment>
            <StatusBar barStyle="light-content" />
            <RNCamera
              style={s.camera}
              onBarCodeRead={({ data, type }) => qrRead(type, data)}
              captureAudio={false}
            />
          </Fragment>
        ) : (
          <Fragment>
            <StatusBar barStyle="dark-content" />
            <ImageBackground
              style={s.map}
              resizeMode="contain"
              onLayout={updateMapDims}
              source={
                point.image.local
                  ? getImage(point.image.uri)
                  : { uri: point.image.uri }
              }
            >
              {height !== -1 &&
                point.qrPoints.map(p => (
                  <MapMarker p={p} width={width} height={height} key={p.id} />
                ))}
            </ImageBackground>
          </Fragment>
        )}
      </View>
      {/* Header */}
      <View style={s.headerContainer}>
        <Text style={s.header}>Collect Point</Text>
        <Text
          style={s.text}
        >{`${point.name}, ${point.completedPoints}/${point.totalPoints}`}</Text>
      </View>
      {/* List */}
      <View style={s.listContainer}>
        <FlatList
          style={s.list}
          data={point.qrPoints}
          renderItem={i => <QrPoint p={i.item} key={i.item.id} />}
        />
      </View>
      {/* Button */}
      <View style={s.buttonBackground}>
        <TouchableOpacity style={s.buttonForeground} onPress={switchToCamera}>
          <Text style={s.buttonText}>
            {cameraOpen ? "Switch to Map" : "Switch to Camera"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStateToProps = (
  state: State,
  ownProps: ICollectOwnProps
): ICollectStateProps => {
  return {
    point: selectExtendedCollectPoint(
      state,
      ownProps.navigation.getParam("id")
    ) as ExtendedCollectPoint
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ICollectOwnProps
): ICollectDispatchProps => {
  return {
    pointCompleted: (id: string) =>
      dispatch(completeQrPoint(ownProps.navigation.getParam("id"), id))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectScreen);
