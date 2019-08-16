package gr.tuc.explorar.location.background;

import android.content.Context;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import gr.tuc.explorar.location.background.model.BackgroundProgress;
import gr.tuc.explorar.location.background.model.ParcelablePoint;
import gr.tuc.explorar.location.background.utils.Haversine;
import gr.tuc.explorar.location.location.HeadingManager;
import gr.tuc.explorar.location.location.PositionManager;

public class BackgroundLocationManager implements HeadingManager.HeadingCallback, PositionManager.PositionCallback {
  private HeadingManager heading;
  private PositionManager position;
  private LocationListener listener;

  // Data
  private List<ParcelablePoint> points;
  private BackgroundProgress progress;

  // Progress
  private List<ParcelablePoint> previousPoints;
  private PositionManager.PositionState currentPosition;
  private long previousTimestamp;

  public BackgroundLocationManager(Context c, LocationListener listener, List<ParcelablePoint> points, @Nullable String previousProgress) {
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

  private double distanceFromUser(ParcelablePoint point) {
    return point.distanceFrom(currentPosition.lat, currentPosition.lon);
  }

  private boolean userWithin(ParcelablePoint point) {
    return distanceFromUser(point) <= point.radius;
  }

  private double bearingFromUser(ParcelablePoint point) {
    return Haversine.bearing(currentPosition.lat, currentPosition.lon, point.lat, point.lon);
  }

  private boolean pointCompleted(ParcelablePoint point) {
    return progress.get(point) > point.duration;
  }

  // the list of current points has only wait points that have not been completed
  private List<ParcelablePoint> calculateCurrentWaitPoints() {
    List<ParcelablePoint> currentPoints = new ArrayList<>();
    for (ParcelablePoint point : points) {
      if (userWithin(point) && point.isWaitPoint && !pointCompleted(point))
        currentPoints.add(point);
    }

    return currentPoints;
  }

  private static List<ParcelablePoint> findIntersection(List<ParcelablePoint> a, List<ParcelablePoint> b) {
    List<ParcelablePoint> intersection = new ArrayList<>();
    for (ParcelablePoint pa : a) {
      for (ParcelablePoint pb : b) {
        if (pa.id.equals(pb.id)) intersection.add(pa);
      }
    }
    return intersection;
  }

  private void updateProgress() {
    // Find common wait points that are not completed
    List<ParcelablePoint> currentPoints = calculateCurrentWaitPoints();
    List<ParcelablePoint> commonPoints = findIntersection(currentPoints, previousPoints);

    double addedTime = (currentPosition.updated - previousTimestamp) / 1000f;

    for (ParcelablePoint p : commonPoints) {
      progress.add(p, addedTime);
    }

    previousTimestamp = currentPosition.updated;
    previousPoints = currentPoints;
  }

  private PointMetadata getMetadata(ParcelablePoint point) {
    return new PointMetadata(
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
    ParcelablePoint closestPoint = null;

    double minDistanceWait = -1;
    ParcelablePoint closestWaitPoint = null;

    List<ParcelablePoint> completedPoints = new ArrayList<>();

    for (ParcelablePoint p : points) {
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
            @Nullable PointMetadata closestPoint,
            @Nullable PointMetadata closestWaitPoint,
            @Nonnull List<ParcelablePoint> completedPoints
    );
  }

  public static class PointMetadata {
    public final ParcelablePoint point;
    public final double progress;
    public final double distance;
    public final double bearing;

    public PointMetadata(ParcelablePoint point, double progress, double distance, double bearing) {
      this.point = point;
      this.progress = progress;
      this.distance = distance;
      this.bearing = bearing;
    }
  }
}
