package gr.tuc.explorar.location.background;

import android.content.Context;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import gr.tuc.explorar.location.background.model.BackgroundProgress;
import gr.tuc.explorar.location.background.model.ParcelPoint;
import gr.tuc.explorar.location.background.utils.Haversine;
import gr.tuc.explorar.location.location.HeadingManager;
import gr.tuc.explorar.location.location.PositionManager;

public class BackgroundLocationManager implements HeadingManager.HeadingCallback, PositionManager.PositionCallback {
  private HeadingManager heading;
  private PositionManager position;
  private LocationListener listener;

  // Data
  private List<ParcelPoint> points;
  private BackgroundProgress progress;

  // Progress
  private List<ParcelPoint> previousPoints;
  private PositionManager.PositionState currentPosition;
  private long previousTimestamp;

  public BackgroundLocationManager(Context c, LocationListener listener, List<ParcelPoint> points, @Nullable String previousProgress) {
    // Setup Listeners
    heading = new HeadingManager(c, false);
    position = new PositionManager(c, false, true);
    this.listener = listener;

    // Setup Data
    this.points = points;
    progress = new BackgroundProgress(points, previousProgress);

    previousPoints = Collections.emptyList();
    currentPosition = PositionManager.PositionState.NUL;
  }

  public void startPosition() {
    position.registerPositionCallback(this);
  }

  public void stopPosition() {
    position.unregisterPositionCallback();
  }

  public void startHeading() {
    heading.registerHeadingCallback(this);
  }

  public void stopHeading() {
    heading.unregisterHeadingCallback();
  }

  public String getProgress() {
    return progress.stringify();
  }

  @Override
  public void onHeadingUpdated(HeadingManager.HeadingState heading) {

  }

  @Override
  public void onPositionUpdated(PositionManager.PositionState position) {
    this.currentPosition = position;

    updateProgress();
    updateListener();
  }

  private double distanceFromUser(ParcelPoint point) {
    return point.distanceFrom(currentPosition.lat, currentPosition.lon);
  }

  private boolean userWithin(ParcelPoint point) {
    return distanceFromUser(point) <= point.radius;
  }

  private double bearingFromUser(ParcelPoint point) {
    return Haversine.bearing(currentPosition.lat, currentPosition.lon, point.lat, point.lon);
  }

  private boolean pointCompleted(ParcelPoint point) {
    return progress.get(point) > point.duration;
  }

  // the list of current points has only wait points that have not been completed
  private List<ParcelPoint> calculateCurrentWaitPoints() {
    List<ParcelPoint> currentPoints = new ArrayList<>();
    for (ParcelPoint point : points) {
      if (userWithin(point) && point.isWaitPoint && !pointCompleted(point))
        currentPoints.add(point);
    }

    return currentPoints;
  }

  private static List<ParcelPoint> findIntersection(List<ParcelPoint> a, List<ParcelPoint> b) {
    List<ParcelPoint> intersection = new ArrayList<>();
    for (ParcelPoint pa : a) {
      for (ParcelPoint pb : b) {
        if (pa.id.equals(pb.id)) intersection.add(pa);
      }
    }
    return intersection;
  }

  private void updateProgress() {
    // Find common wait points that are not completed
    List<ParcelPoint> currentPoints = calculateCurrentWaitPoints();
    List<ParcelPoint> commonPoints = findIntersection(currentPoints, previousPoints);

    double addedTime = (currentPosition.updated - previousTimestamp) / 1000f;

    for (ParcelPoint p : commonPoints) {
      progress.add(p, addedTime);
    }

    previousTimestamp = currentPosition.updated;
    previousPoints = currentPoints;
  }

  private ParcelPoint.Metadata getMetadata(ParcelPoint point) {
    return new ParcelPoint.Metadata(
            point,
            point.isWaitPoint ? progress.get(point) : -1,
            distanceFromUser(point),
            bearingFromUser(point)
    );
  }

  private void updateListener() {
    if (points.size() == 0) return;
    // Find closest point
    double minDistance = -1;
    ParcelPoint closestPoint = null;

    double minDistanceWait = -1;
    ParcelPoint closestWaitPoint = null;

    List<ParcelPoint> completedPoints = new ArrayList<>();

    for (ParcelPoint p : points) {
      if (pointCompleted(p)) {
        completedPoints.add(p);
        continue;
      }
      double distance = distanceFromUser(p);

      if (distance <= minDistance || minDistance < 0) {
        closestPoint = p;
        minDistance = distance;
      }

      if (p.isWaitPoint && (distance <= minDistanceWait || minDistanceWait < 0)) {
        closestWaitPoint = p;
        minDistanceWait = distance;
      }
    }

    listener.onDataUpdated(
            closestPoint != null ? getMetadata(closestPoint) : null,
            closestWaitPoint != null ? getMetadata(closestWaitPoint) : null,
            completedPoints
    );
  }

  public interface LocationListener {
    void onDataUpdated(
            @Nullable ParcelPoint.Metadata closestPoint,
            @Nullable ParcelPoint.Metadata closestWaitPoint,
            @Nonnull List<ParcelPoint> completedPoints
    );
  }

}