package gr.tuc.explorar.location.foreground;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;

import static android.content.Context.SENSOR_SERVICE;

public class ForegroundHeadingManager implements SensorEventListener {

  private HeadingCallback callback;

  private SensorManager sensorManager;
  private final float[] accelerometerReading = new float[3];
  private final float[] magnetometerReading = new float[3];

  private final float[] rotationMatrix = new float[9];
  private final float[] orientationAngles = new float[3];

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

    Sensor accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
    if (accelerometer != null) {
      sensorManager.registerListener(this, accelerometer,
              SensorManager.SENSOR_DELAY_NORMAL, SensorManager.SENSOR_DELAY_UI);
    }
    Sensor magneticField = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
    if (magneticField != null) {
      sensorManager.registerListener(this, magneticField,
              SensorManager.SENSOR_DELAY_NORMAL, SensorManager.SENSOR_DELAY_UI);
    }
  }

  public void unregisterHeadingCallback() {
    sensorManager.unregisterListener(this);
    callback = null;
  }

  @Override
  public void onAccuracyChanged(Sensor sensor, int accuracy) {
  }

  // Get readings from accelerometer and magnetometer. To simplify calculations,
  // consider storing these readings as unit vectors.
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
    }
    updateOrientationAngles();

    callback.onHeadingUpdated(new HeadingState(
            orientationAngles[0],
            System.currentTimeMillis(),
            true
    ));
  }

  // Compute the three orientation angles based on the most recent readings from
  // the device's accelerometer and magnetometer.
  public void updateOrientationAngles() {
    // Update rotation matrix, which is needed to update orientation angles.
    SensorManager.getRotationMatrix(rotationMatrix, null,
            accelerometerReading, magnetometerReading);

    // "mRotationMatrix" now has up-to-date information.

    SensorManager.getOrientation(rotationMatrix, orientationAngles);

    // "mOrientationAngles" now has up-to-date information.
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
