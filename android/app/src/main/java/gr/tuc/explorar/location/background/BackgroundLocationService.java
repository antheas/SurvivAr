package gr.tuc.explorar.location.background;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import androidx.annotation.Nullable;

import gr.tuc.explorar.BuildConfig;
import gr.tuc.explorar.SplashActivity;

public class BackgroundLocationService extends Service {

  public static final String POINT_DATA_KEY = "points";
  public static final String PROGRESS_DATA_KEY = "progress";

  public static final String ACTION_INITIALISE = BuildConfig.APPLICATION_ID + "/initialise";
  public static final String ACTION_REFRESH = BuildConfig.APPLICATION_ID + "/refresh";
  public static final String ACTION_EXIT = BuildConfig.APPLICATION_ID + "/exit";

  private BackgroundNotificationManager manager;

  @Override
  public void onCreate() {
    super.onCreate();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    final int returnFlag = START_NOT_STICKY;

    // Intent and action should never be null
    if (intent == null || intent.getAction() == null) {
      stopSelf();
      // In case function returns
      return returnFlag;
    }

    String action = intent.getAction();

    // Handle actions
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

    manager = new BackgroundNotificationManager(
            this,
            getOpenAppIntent(),
            getExitIntent(),
            getRefreshIntent());
    manager.startForeground(this);

    Intent intent2 = new Intent();
    intent2.setAction(ACTION_EXIT);

    return returnFlag;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void exitService() {
    stopSelf();
  }

  private void refreshData() {

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
}
