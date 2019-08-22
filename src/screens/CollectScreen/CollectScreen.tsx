import React, { Fragment, FunctionComponent, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
import * as Theme from "../../utils/Theme";
import { ellipsis } from "../../utils/Theme";
import { Spacer } from "../../utils/Components";

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
  headerContainer: {
    flex: 1,
    flexGrow: 1.9
  },
  listContainer: {
    flex: 6,
    flexGrow: 1.9
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
    ...Theme.text.color.normal,
    ...Theme.text.size.small,
    marginBottom: 12
  },
  list: {
    width: "100%",
    flex: 0
  },
  single: {
    width: "100%",
    flex: 1,
    justifyContent: "center"
  },

  pointContainer: {
    flexDirection: "row"
  },
  pointIcon: {
    color: Theme.colors.success,
    fontSize: 40
  },
  pointText: {
    ...Theme.text.size.medium,
    ...Theme.text.color.success
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

interface ICollectStateProps {
  point?: ExtendedCollectPoint;
}

interface ICollectDispatchProps {
  pointCompleted: (p: string) => void;
}

export interface ICollectOwnProps {
  navigation: NavigationScreenProp<any>;
  pointId: string;
}

export interface ICollectProps
  extends ICollectStateProps,
    ICollectDispatchProps,
    ICollectOwnProps {}

const QrPoint = ({ p }: { p: ExtendedQrPoint }) => {
  return (
    <View style={s.pointContainer}>
      <Icon name={p.icon} style={s.pointIcon} />
      <Spacer medium horz />
      <View>
        <Text style={s.pointText}>{ellipsis(p.name, 25)}</Text>
        <Text style={s.pointSubText}>{ellipsis(p.desc, 35)}</Text>
      </View>
    </View>
  );
};

const CollectScreen: FunctionComponent<ICollectProps> = ({
  point,
  pointCompleted,
  navigation
}) => {
  const [cameraOpen, setCameraOpen] = useState(false);

  if (!point) {
    navigation.goBack();
    return null;
  }

  const switchToCamera = () => {
    setCameraOpen(!cameraOpen);
  };

  const qrRead = (type: string, data: string) => {
    const p = point.qrPoints.find(
      qr => !qr.completed && qr.qrData.type === type && qr.qrData.data === data
    );

    // TODO: Handle error
    if (p) pointCompleted(p.id);
  };

  return (
    <View style={s.container}>
      {/* Map or camera container */}
      <View style={s.mapContainer}>
        {cameraOpen ? (
          <RNCamera onBarCodeRead={({ data, type }) => qrRead(type, data)} />
        ) : (
          <Fragment>
            <Image source={{ uri: point.imageUri }} />
          </Fragment>
        )}
      </View>
      {/* Header */}
      <View style={s.headerContainer}>
        <Text style={s.header}>Collect Point</Text>
      </View>
      {/* List */}
      <FlatList
        style={s.list}
        data={point.qrPoints}
        renderItem={i => <QrPoint p={i.item} key={i.item.id} />}
      />
      {/* Button */}
      <View style={s.buttonBackground}>
        <TouchableOpacity style={s.buttonForeground} onPress={switchToCamera}>
          <Text style={s.buttonText}>
            {!cameraOpen ? "Switch to Map" : "Switch to Camera"}
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
      ownProps.pointId
    ) as ExtendedCollectPoint
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ICollectOwnProps
): ICollectDispatchProps => {
  return {
    pointCompleted: (id: string) =>
      dispatch(completeQrPoint(ownProps.pointId, id))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectScreen);
