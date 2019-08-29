import React, { FunctionComponent, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { clearCompletedPoints } from "../store/actions";
import { ExtendedPoint } from "../store/model/ExtendedPoint";
import { selectCompletedPoints } from "../store/selectors";
import { State } from "../store/types";
import { Spacer } from "../utils/Components";
import * as Theme from "../utils/Theme";
import { ellipsis } from "../utils/Theme";

const s = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    width: "100%",
    justifyContent: "flex-end"
  },
  modal: {
    ...Theme.component.container.accented,
    flex: 0,
    maxHeight: 250,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 17,
    borderTopStartRadius: 15,
    borderTopEndRadius: 15,
    borderColor: Theme.colors.accentDark,
    borderStartWidth: 2,
    borderTopWidth: 2,
    borderEndWidth: 2
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
    width: "100%"
  },
  single: {
    width: "100%"
    // justifyContent: "center"
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

const CompletedPoint = ({ p }: { p: ExtendedPoint }) => {
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

interface ICompletedModalStateProps {
  completedPoints: ExtendedPoint[];
}

interface ICompletedModalDispatchProps {
  clearPoints: () => void;
}

interface ICompleteModalProps
  extends ICompletedModalStateProps,
    ICompletedModalDispatchProps {
  navigation: NavigationScreenProp<any>;
}

const CompletedModal: FunctionComponent<ICompleteModalProps> = ({
  completedPoints,
  clearPoints,
  navigation
}) => {
  // Clear points and go back
  const exit = () => {
    clearPoints();
    navigation.goBack();
  };

  // Also clear with back button press
  useEffect(() => {
    const listener = navigation.addListener("willBlur", clearPoints);
    return () => listener && listener.remove();
  }, []);

  return (
    <View style={s.container}>
      <View style={s.modal}>
        <View>
          <Text style={s.header}>Completed Points</Text>
        </View>
        <Text style={s.text}>
          Congratulations! You have completed the following:
        </Text>
        {completedPoints.length === 1 ? (
          <View style={s.single}>
            <CompletedPoint p={completedPoints[0]} />
          </View>
        ) : (
          <FlatList
            style={s.list}
            data={completedPoints}
            renderItem={i => <CompletedPoint p={i.item} key={i.item.id} />}
          />
        )}
      </View>
      <View style={s.buttonBackground}>
        <TouchableOpacity style={s.buttonForeground} onPress={exit}>
          <Text style={s.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStateToProps = (state: State): ICompletedModalStateProps => {
  return {
    completedPoints: selectCompletedPoints(state)
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch
): ICompletedModalDispatchProps => {
  return {
    clearPoints: () => dispatch(clearCompletedPoints())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompletedModal);
