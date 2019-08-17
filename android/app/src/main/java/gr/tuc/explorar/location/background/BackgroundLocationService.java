package gr.tuc.explorar.location.background;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Binder;
import android.os.IBinder;
import android.preference.PreferenceManager;

import androidx.annotation.Nullable;

import java.util.List;

import javax.annotation.Nonnull;

import gr.tuc.explorar.BuildConfig;
import gr.tuc.explorar.SplashActivity;
import gr.tuc.explorar.location.background.model.BackgroundProgress;
import gr.tuc.explorar.location.background.model.ParcelPoint;
import gr.tuc.explorar.location.background.notification.BackgroundNotificationManager;

public class BackgroundLocationService extends Service implements BackgroundLocationManager.LocationListener {

  public static final String POINT_DATA_KEY = "points";
  public static final String PROGRESS_DATA_KEY = "progress";

  public static final String ACTION_INITIALISE = BuildConfig.APPLICATION_ID + "/initialise";
  public static final String ACTION_REFRESH = BuildConfig.APPLICATION_ID + "/refresh";
  public static final String ACTION_EXIT = BuildConfig.APPLICATION_ID + "/exit";

  private BackgroundNotificationManager notifications;
  private BackgroundLocationManager manager;

  // We need to know if the service was started when we bind to it to avoid retrieving invalid data.
  private boolean serviceStarted;
  // If the binder of the service is called to retrieve the progress this will be set to true.
  // That way when the service is destroyed, writing to shared preferences will be skipped.
  private boolean progressSaved;

  @Override
  public void onCreate() {
    super.onCreate();
    serviceStarted = false;
    progressSaved = false;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    final int returnFlag = START_NOT_STICKY;

    // Intent and action should never be null
    if (intent == null || intent.getAction() == null) {
      throw new RuntimeException("Intent is null!");
    }

    // Handle actions
    String action = intent.getAction();
    switch (action) {
      case ACTION_REFRESH:
        refreshData();
        return returnFlag;
      case ACTION_EXIT:
        exitService();
        return returnFlag;
    }

    // From now on we run initialisation
    if (!ACTION_INITIALISE.equals(action)) return returnFlag;

    notifications = new BackgroundNotificationManager(
            this,
            getOpenAppIntent(),
            getExitIntent(),
            getRefreshIntent());
    notifications.startForeground(this);

    // Point Data
    List<ParcelPoint> points = intent.getParcelableArrayListExtra(POINT_DATA_KEY);

    // Previous Progress
    SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
    String previousProgress = sp.getString(PROGRESS_DATA_KEY, null);
    // Clear previous progress
    if (previousProgress != null) sp.edit().remove(PROGRESS_DATA_KEY).apply();

    manager = new BackgroundLocationManager(this, this, points, previousProgress);
    manager.startPosition();

    // Service has started
    serviceStarted = true;

    return returnFlag;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    deactivateService();
    saveProgress();
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return new ProgressBinder();
  }

  private void exitService() {
    deactivateService();
    stopSelf();
  }

  private void refreshData() {
    if (manager != null) {
      manager.refreshPosition();
    }
  }

  private void deactivateService() {
    if (!serviceStarted) return;

    manager.stopHeading();
    manager.stopPosition();
  }

  private void saveProgress() {
    if (!serviceStarted || progressSaved) return;

    // Save progress
    PreferenceManager.getDefaultSharedPreferences(this)
            .edit()
            .putString(PROGRESS_DATA_KEY,
                    manager.getProgress().stringify())
            .apply();

    progressSaved = true;
  }

  private PendingIntent getOpenAppIntent() {
    Intent openAppIntent = new Intent(this, SplashActivity.class);
    openAppIntent.setAction(Intent.ACTION_MAIN);
    openAppIntent.addCategory(Intent.CATEGORY_LAUNCHER);
    openAppIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

    return PendingIntent.getActivity(this, 0, openAppIntent, 0);
  }

  private PendingIntent getRefreshIntent() {
    Intent intent = new Intent(ACTION_REFRESH, null, this, BackgroundLocationService.class);
    return PendingIntent.getService(this, 0, intent, 0);
  }

  private PendingIntent getExitIntent() {
    Intent intent = new Intent(ACTION_EXIT, null, this, BackgroundLocationService.class);
    return PendingIntent.getService(this, 0, intent, 0);
  }

  @Override
  public void onDataUpdated(
          @Nullable ParcelPoint.Metadata closestPoint,
          @Nullable ParcelPoint.Metadata closestWaitPoint,
          @Nonnull List<ParcelPoint> completedPoints,
          int event) {
    if (progressSaved) return;
    notifications.updateNotification(closestPoint, closestWaitPoint, completedPoints, event);
  }

  /**
   * If the service is active when we try to retrieve the progress, we can not use
   * shared preferences because we can't be sure when onDestroy will be called or when
   * the changes will be applied.
   * <p>
   * So this binder retrieves the progress of the service before it's shut down.
   */
  public class ProgressBinder extends Binder {
    public boolean isServiceRunning() {
      return BackgroundLocationService.this.serviceStarted;
    }

    public BackgroundProgress getProgress() {
      BackgroundLocationService.this.deactivateService();
      BackgroundLocationService.this.progressSaved = true;
      return BackgroundLocationService.this.manager.getProgress();
    }
  }
}
