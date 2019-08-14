import React, { ReactElement } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";
import { ExtendedCollectPoint } from "../../store/model/ExtendedCollectPoint";
import { ExtendedPoint } from "../../store/model/ExtendedPoint";
import { ExtendedWaitPoint } from "../../store/model/ExtendedWaitPoint";
import { selectExtendedPoints } from "../../store/selectors";
import { State } from "../../store/types";
import { Glue, Spacer } from "../../utils/Components";
import * as Theme from "../../utils/Theme";

const styles = StyleSheet.create({
  card: {
    ...Theme.component.container.card
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
  cardDistance: {
    ...Theme.text.size.medium,
    alignSelf: "flex-end"
  },
  distanceInRange: {
    color: Theme.colors.success
  },
  distanceNotInRange: {
    color: Theme.colors.primaryDark
  },
  header: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
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
  return p.userWithin ? styles.distanceInRange : styles.distanceNotInRange;
}

const PointCard = ({ item: p }: { item: ExtendedPoint }): ReactElement => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardName}>{p.name}</Text>
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
      <Glue />
      {!p.completed && (
        <Text style={{ ...styles.cardDistance, ...chooseDistanceColor(p) }}>
          {`${p.distance.toFixed(0)}m / ${p.radius}m`}
        </Text>
      )}
    </View>
  );
};

const ListHeader = ({
  section: { title }
}: {
  section: { title: string };
}): ReactElement => (
  <View style={styles.header}>
    <Text style={styles.headerText}>{title}</Text>
  </View>
);

export const PointCardList = ({
  points
}: {
  points: ExtendedPoint[];
}): ReactElement => {
  const sorted = points.sort((a, b) => a.distance - b.distance);

  const active = sorted.filter((p): boolean => !p.completed && p.userWithin);
  const pending = sorted.filter((p): boolean => !p.completed && !p.userWithin);
  const completed = sorted.filter((p): boolean => p.completed);

  const sections = [];
  if (active.length) sections.push({ title: "Active", data: active });
  if (pending.length) sections.push({ title: "Pending", data: pending });
  if (completed.length) sections.push({ title: "Completed", data: completed });

  return (
    <SectionList
      style={styles.list}
      renderItem={PointCard}
      renderSectionHeader={ListHeader}
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
