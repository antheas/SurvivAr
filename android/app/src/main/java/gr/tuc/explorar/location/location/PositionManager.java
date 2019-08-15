package gr.tuc.explorar.location.location;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location;
import android.os.Build;
import android.os.HandlerThread;
import android.os.Looper;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;

public class PositionManager {

  private static final int FAST = 0;
  private static final int NORMAL = 1;
  private static final int SLOW = 2;

  private static final String THREAD_NAME = "location_callback_thread";

  private static final int MAX_INTERVAL = 1000;

  private FusedLocationProviderClient client;
  private Context context;
  private boolean spawnThread;
  private HandlerThread thread;
  private LocationCallback currentCallback;

  private boolean inBackground;
  private int currentSpeed;
  private long updatesSinceLastSpeedChange;

  // Foreground thread gets killed so we need to spawn a thread.
  public PositionManager(Context c, boolean spawnThread, boolean inBackground) {
    client = new FusedLocationProviderClient(c);
    currentSpeed = FAST;
    updatesSinceLastSpeedChange = 0;
    this.context = c;
    this.spawnThread = spawnThread;
    this.inBackground = inBackground;
  }

  @SuppressLint("MissingPermission")
  public void registerPositionCallback(PositionCallback callback) {
    Looper looper;
    if (spawnThread) {
      thread = new HandlerThread(THREAD_NAME);
      thread.start();
      looper = thread.getLooper();
    } else {
      looper = context.getMainLooper();
    }

    client.getLastLocation().addOnSuccessListener(l -> callback.onPositionUpdated(toState(l)));

    currentCallback = new LocationCallback() {
      @Override
      public void onLocationResult(LocationResult l) {
        callback.onPositionUpdated(toState(l.getLastLocation()));
      }
    };

    client.requestLocationUpdates(
            getLocationRequest(currentSpeed),
            currentCallback,
            looper);
  }

  public void unregisterPositionCallback() {
    if(currentCallback == null) return;
    client.flushLocations();
    client.removeLocationUpdates(currentCallback);
    currentCallback = null;

    if (!spawnThread || thread == null) return;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
      thread.quitSafely();
    } else {
      thread.quit();
    }
    thread = null;
  }

  @SuppressLint("MissingPermission")
  public void setClosestPointDistance(double distance) {
    int newSpeed = getUpdatedSpeed(distance);
    if (newSpeed == currentSpeed) {
      updatesSinceLastSpeedChange = 0;
      return;
    }

    // The following request will re-trigger an update which may have stale data
    // If the stale location distance is big then it will re-trigger a speed change
    // which will cause an endless loop
    // While in background the update rate is much smaller so we require less updates to stay responsive.
    if (updatesSinceLastSpeedChange < (inBackground ? 2 : 10)) {
      updatesSinceLastSpeedChange++;
      return;
    }
    updatesSinceLastSpeedChange = 0;
    currentSpeed = newSpeed;

    // If we have changed speed we have to re-register the callback with the new speed.
    client.requestLocationUpdates(
            getLocationRequest(currentSpeed),
            currentCallback,
            thread.getLooper());
  }

  private static PositionState toState(Location l) {
    return new PositionState(
            l.getLatitude(),
            l.getLongitude(),
            l.getAccuracy(),
            l.getTime(),
            true);
  }

  private int getUpdatedSpeed(double distance) {
    if (distance < 250) {
      return FAST;
    } else if (distance < 1000) {
      return NORMAL;
    } else {
      return SLOW;
    }
  }

  private LocationRequest getLocationRequest(int speed) {
    if (!inBackground) {
      // When the screen is on the user might be looking at the map, so we require a high update rate
      // even when we are far away
      switch (speed) {
        case FAST:
          return new LocationRequest()
                  .setFastestInterval(MAX_INTERVAL)
                  .setInterval(2000)
                  .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        case NORMAL:
          return new LocationRequest()
                  .setFastestInterval(MAX_INTERVAL)
                  .setInterval(10000)
                  .setPriority(LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY);
        case SLOW:
          // fallthrough
        default:
          return new LocationRequest()
                  .setFastestInterval(MAX_INTERVAL)
                  .setInterval(30000)
                  .setPriority(LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY)
                  .setSmallestDisplacement(30);
      }
    } else {
      switch (speed) {
        case FAST:
          return new LocationRequest()
                  .setFastestInterval(MAX_INTERVAL)
                  .setInterval(1000)
                  .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        case NORMAL:
          return new LocationRequest()
                  .setFastestInterval(MAX_INTERVAL)
                  .setInterval(toMs(2))
                  .setSmallestDisplacement(130)
                  .setPriority(LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY);
        case SLOW:
          // fallthrough
        default:
          return new LocationRequest()
                  .setFastestInterval(MAX_INTERVAL)
                  .setInterval(toMs(5))
                  .setSmallestDisplacement(100)
                  .setPriority(LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY);
      }
    }
  }

  private long toMs(int minutes) {
    return 60 * 1000 * minutes;
  }

  public static class PositionState {
    public static final PositionState NUL = new PositionState(0, 0, 0, 0, false);

    public final double lat;
    public final double lon;
    public final double accuracy;
    public final long updated;
    public final boolean valid;

    public PositionState(double lat, double lon, double accuracy, long updated, boolean valid) {
      this.lat = lat;
      this.lon = lon;
      this.accuracy = accuracy;
      this.updated = updated;
      this.valid = valid;
    }
  }

  public interface PositionCallback {
    void onPositionUpdated(PositionState location);
  }
}
