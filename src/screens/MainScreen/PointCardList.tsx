import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  memo
} from "react";
import {
  SectionList,
  SectionListStatic,
  StyleSheet,
  Text,
  View,
  ViewToken,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
import { ExtendedCollectPoint } from "../../store/model/ExtendedCollectPoint";
import { ExtendedPoint } from "../../store/model/ExtendedPoint";
import { ExtendedWaitPoint } from "../../store/model/ExtendedWaitPoint";
import { selectExtendedPoints } from "../../store/selectors";
import { State } from "../../store/types";
import { Glue, Spacer } from "../../utils/Components";
import * as Theme from "../../utils/Theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HEADER_WIDTH = 45;
const ITEM_WIDTH = 220;

const styles = StyleSheet.create({
  card: {
    ...Theme.component.container.card,
    // TODO: Find better width
    width: ITEM_WIDTH
  },
  cardName: {
    ...Theme.text.color.dark,
    ...Theme.text.size.large
  },
  cardDesc: {
    ...Theme.text.color.normal,
    ...Theme.text.size.mini
  },
  cardProgress: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end"
  },
  progressDetail: Theme.text.size.medium,
  progressStatus: Theme.text.size.mini,
  progressCompleted: {
    color: Theme.colors.success
  },
  progressPending: Theme.text.color.normal,
  progressActive: {
    color: Theme.colors.warningDark
  },
  cardBottom: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  cardOpen: {
    ...Theme.text.size.large
  },
  openButton: {
    height: "100%",
    flex: 1,
    justifyContent: "flex-end"
  },
  cardIcon: {
    ...Theme.text.size.large
  },
  cardDistance: {
    ...Theme.text.size.medium
  },
  distanceInRange: {
    color: Theme.colors.success
  },
  distanceNotInRange: {
    color: Theme.colors.primaryDark
  },
  header: {
    height: "100%",
    width: HEADER_WIDTH,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    width: 170,
    textAlign: "center",
    transform: [{ rotate: "270deg" }],
    color: Theme.colors.primaryText,
    ...Theme.text.size.medium
  },
  list: {}
});

function chooseProgressColor(p: ExtendedPoint) {
  if (p.completed) return styles.progressCompleted;
  if (p.userWithin) return styles.progressActive;
  return styles.progressPending;
}

function chooseDistanceColor(p: ExtendedPoint) {
  return p.userWithin || p.completed
    ? styles.distanceInRange
    : styles.distanceNotInRange;
}

const PointCard = ({
  p,
  open
}: {
  p: ExtendedPoint;
  open: () => void;
}): ReactElement => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardName}>
        {p.name.length > 30 ? p.name.substring(0, 30) : p.name + "..."}
      </Text>
      <Text style={styles.cardDesc}>{p.desc}</Text>
      <Spacer tiny />
      <View style={styles.cardProgress}>
        <Text style={{ ...styles.progressDetail, ...chooseProgressColor(p) }}>
          {p instanceof ExtendedWaitPoint &&
            `${Math.floor(p.completedDuration)}s / ${p.duration}s`}
          {p instanceof ExtendedCollectPoint &&
            `${p.completedPoints} / ${p.totalPoints}`}
        </Text>
        <Spacer small horz />
        <Text style={{ ...styles.progressStatus, ...chooseProgressColor(p) }}>
          {p.completed
            ? "Completed"
            : p.userWithin
            ? "Active"
            : "Not Completed"}
        </Text>
      </View>
      <View style={styles.cardBottom}>
        {!p.completed && p.userWithin && p instanceof ExtendedCollectPoint ? (
          <TouchableOpacity onPress={open} style={styles.openButton}>
            <Text style={{ ...styles.cardOpen, ...chooseDistanceColor(p) }}>
              OPEN
            </Text>
          </TouchableOpacity>
        ) : (
          <Icon
            name={p.icon}
            style={{ ...styles.cardIcon, ...chooseDistanceColor(p) }}
          />
        )}
        {!p.completed && (
          <Text style={{ ...styles.cardDistance, ...chooseDistanceColor(p) }}>
            {`${p.distance.toFixed(0)}m / ${p.radius}m`}
          </Text>
        )}
      </View>
    </View>
  );
};

const ListHeader = ({ title }: { title: string }): ReactElement => (
  <View style={styles.header}>
    <Text style={styles.headerText}>{title}</Text>
  </View>
);

// Memoize Point Card to speed up updates.
const MemoPointCard = memo(PointCard);

// We only animate on marker pressed to avoid acting on our own update
export interface PointSelection {
  markerPressed: boolean;
  selectedId: string;
}

export interface IPointCardListProps {
  points: ExtendedPoint[];
  gotoPointId: string | null;
  onPoint: (id: string) => void;
  pointOpened: (id: string) => void;
  resetGotoPoint: () => void;
}

export const PointCardList: FunctionComponent<IPointCardListProps> = ({
  points,
  gotoPointId,
  onPoint,
  pointOpened,
  resetGotoPoint
}) => {
  const sorted = points.sort((a, b) => a.distance - b.distance);

  const active = sorted.filter((p): boolean => !p.completed && p.userWithin);
  const pending = sorted.filter((p): boolean => !p.completed && !p.userWithin);
  const completed = sorted.filter((p): boolean => p.completed);

  const sections = [];
  if (active.length) sections.push({ title: "Active", data: active });
  if (pending.length) sections.push({ title: "Pending", data: pending });
  if (completed.length) sections.push({ title: "Completed", data: completed });

  // When we scroll update visible point
  const onViewableItemsChanged = ({
    viewableItems
  }: {
    viewableItems: ViewToken[];
  }) => {
    const selectedItem = viewableItems.find(v => v.isViewable);
    if (!selectedItem || !selectedItem.item) return;
    // Check if it is the section title
    // If it is select the first point
    if (selectedItem.item.data && selectedItem.item.data.length) {
      onPoint(selectedItem.item.data[0].id);
      return;
    }

    // Otherwise we have an object, its key is the id.
    else if (selectedItem.key) onPoint(selectedItem.key);
  };

  // Scroll to point
  const listRef = useRef(null);
  useEffect(() => {
    if (!gotoPointId) return;
    const view = listRef.current as SectionListStatic<any> | null;
    if (!view || !view.scrollToLocation) return;

    const id = gotoPointId;
    const iActive = active.findIndex(p => p.id === id);
    const iPending = pending.findIndex(p => p.id === id);
    const iCompleted = completed.findIndex(p => p.id === id);

    let sectionIndex;
    let itemIndex;
    if (iActive !== -1) {
      sectionIndex = 0;
      itemIndex = iActive;
    } else if (iPending !== -1) {
      sectionIndex = +(active.length > 0);
      itemIndex = iPending;
    } else if (iCompleted !== -1) {
      sectionIndex = +(active.length > 0) + +(pending.length > 0);
      itemIndex = iCompleted;
    } else return;
    itemIndex++;

    view.scrollToLocation({
      animated: true,
      sectionIndex,
      itemIndex,
      viewOffset: HEADER_WIDTH,
      viewPosition: 0.5
    });
  }, [gotoPointId]);

  return (
    <SectionList
      ref={listRef}
      style={styles.list}
      renderItem={i => (
        <MemoPointCard
          p={i.item}
          key={i.item.id}
          open={() => pointOpened(i.item.id)}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <ListHeader title={title} />
      )}
      onViewableItemsChanged={onViewableItemsChanged}
      // Stop errors
      onScrollToIndexFailed={resetGotoPoint}
      viewabilityConfig={{ itemVisiblePercentThreshold: 100 }}
      horizontal={true}
      sections={sections}
    />
  );
};

const mapStateToProps = (state: State): { points: ExtendedPoint[] } => {
  return {
    points: selectExtendedPoints(state)
  };
};

export default connect(mapStateToProps)(PointCardList);
