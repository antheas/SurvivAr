package gr.tuc.explorar.location.foreground;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location;
import android.os.Build;
import android.os.HandlerThread;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;

public class ForegroundLocationManager {

  private static final int FAST = 0;
  private static final int NORMAL = 1;
  private static final int SLOW = 2;

  private static final String THREAD_NAME = "location_callback_thread";

  private FusedLocationProviderClient client;
  private HandlerThread thread;
  private LocationCallback currentCallback;
  private int currentSpeed;

  public ForegroundLocationManager(Context c) {
    client = new FusedLocationProviderClient(c);
    currentSpeed = 0;
  }

  @SuppressLint("MissingPermission")
  public void registerPositionCallback(PositionCallback callback) {
    thread = new HandlerThread(THREAD_NAME);
    thread.start();
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
            thread.getLooper());
  }

  public void unregisterLocationCallback() {
    if(currentCallback == null) return;
    client.removeLocationUpdates(currentCallback);
    currentCallback = null;

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
    if (newSpeed == currentSpeed) return;

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
    switch (speed) {
      case FAST:
        return new LocationRequest()
                .setFastestInterval(1000)
                .setInterval(2000)
                .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
      case NORMAL:
        return new LocationRequest()
                .setFastestInterval(1000)
                .setInterval(10000)
                .setPriority(LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY);
      case SLOW:
        // fallthrough
      default:
        return new LocationRequest()
                .setFastestInterval(0)
                .setInterval(30000)
                .setFastestInterval(1000)
                .setPriority(LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY)
                .setSmallestDisplacement(30);
    }
  }

  public static class PositionState {
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
