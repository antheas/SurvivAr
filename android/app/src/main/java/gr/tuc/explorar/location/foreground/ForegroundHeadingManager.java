package gr.tuc.explorar.location.foreground;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;

import static android.content.Context.SENSOR_SERVICE;

public class ForegroundHeadingManager implements SensorEventListener {

  private static final String THREAD_ID = "location_heading_thread";
  private static final Double FILTER = 10d;

  private HeadingCallback callback;
  private HandlerThread thread;

  private SensorManager sensorManager;
  private final float[] accelerometerReading = new float[3];
  private final float[] magnetometerReading = new float[3];

  private final float[] rotationMatrix = new float[9];
  private final float[] orientationAngles = new float[3];

  private double currAzimuth = 0;

  public ForegroundHeadingManager(Context c) {
    sensorManager = (SensorManager) c.getSystemService(SENSOR_SERVICE);
  }

  public void registerHeadingCallback(HeadingCallback callback) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {
      // TODO: Handle kitkat more gracefully
      callback.onHeadingUpdated(new HeadingState(
              0, 0, false
      ));
      return;
    }

    this.callback = callback;

    // Create thread for callbacks
    thread = new HandlerThread(THREAD_ID);
    thread.start();
    Handler handler = new Handler(thread.getLooper());

    Sensor accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
    if (accelerometer != null) {
      sensorManager.registerListener(this, accelerometer,
              SensorManager.SENSOR_DELAY_NORMAL, SensorManager.SENSOR_DELAY_UI, handler);
    }
    Sensor magneticField = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
    if (magneticField != null) {
      sensorManager.registerListener(this, magneticField,
              SensorManager.SENSOR_DELAY_NORMAL, SensorManager.SENSOR_DELAY_UI, handler);
    }
  }

  public void unregisterHeadingCallback() {
    sensorManager.unregisterListener(this);
    callback = null;

    if (thread == null) return;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
      thread.quitSafely();
    } else {
      thread.quit();
    }
    thread = null;
  }

  @Override
  public void onAccuracyChanged(Sensor sensor, int accuracy) {
  }

  @Override
  public void onSensorChanged(SensorEvent event) {
    if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
      System.arraycopy(event.values, 0, accelerometerReading,
              0, accelerometerReading.length);
    } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
      System.arraycopy(event.values, 0, magnetometerReading,
              0, magnetometerReading.length);
    }

    // inform callback
    if (callback == null) {
      unregisterHeadingCallback();
      return;
    }

    boolean success = SensorManager.getRotationMatrix(rotationMatrix, null,
            accelerometerReading, magnetometerReading);
    if (!success) return;

    SensorManager.getOrientation(rotationMatrix, orientationAngles);

    double newAzimuth = Math.toDegrees(orientationAngles[0]);
    newAzimuth = (newAzimuth + 360) % 360;

    if (Math.abs(newAzimuth - currAzimuth) >= FILTER) {
      currAzimuth = newAzimuth;
      callback.onHeadingUpdated(new HeadingState(
              newAzimuth,
              System.currentTimeMillis(),
              true
      ));
    }
  }

  public static class HeadingState {
    public final double degrees;
    public final long updated;
    public final boolean valid;

    public HeadingState(double degrees, long updated, boolean valid) {
      this.degrees = degrees;
      this.updated = updated;
      this.valid = valid;
    }
  }

  public interface HeadingCallback {
    void onHeadingUpdated(HeadingState heading);
  }
}
