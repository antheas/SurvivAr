package gr.tuc.explorar.location.background.notification;

import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import gr.tuc.explorar.R;

class BackgroundNotificationBuilder {

  private static final String NOTIFICATION_GROUP_ID = "location_persistent_group_id";
  private static final String NOTIFICATION_PERSISTENT_ID = "location_notification_persistent";
  private static final String NOTIFICATION_ON_ENTER_ID = "location_notification_on_enter";
  private static final String NOTIFICATION_ON_EXIT_ID = "location_notification_on_exit";
  private static final String NOTIFICATION_ON_COMPLETE_ID = "location_notification_on_complete";

  private static final long[] VIBRATION_ON_ENTER = {0, 400};
  private static final long[] VIBRATION_ON_EXIT = {0, 600};
  private static final long[] VIBRATION_ON_COMPLETE = {0, 400, 250, 400};

  private Context c;
  private PendingIntent onClick;
  private PendingIntent onRefresh;
  private PendingIntent onExit;

  public BackgroundNotificationBuilder(Context c, PendingIntent onClick, PendingIntent onRefresh, PendingIntent onExit) {
    this.c = c;
    this.onClick = onClick;
    this.onRefresh = onRefresh;
    this.onExit = onExit;
  }

  private static void createChannelGroup(Context c, NotificationManager nm) {
    // NotificationChannels are required for Notifications on O (API 26) and above.
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

    NotificationChannelGroup ng = new NotificationChannelGroup(
            NOTIFICATION_GROUP_ID,
            c.getString(R.string.location_notification_channel_group_name));
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      ng.setDescription(c.getString(R.string.location_notification_channel_group_description));
    }
    nm.createNotificationChannelGroup(ng);
  }

  private static void createPersistentNotificationChannel(Context c, NotificationManager nm) {
    // NotificationChannels are required for Notifications on O (API 26) and above.
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

    // Initializes NotificationChannel.
    NotificationChannel nc = new NotificationChannel(
            NOTIFICATION_PERSISTENT_ID,
            c.getString(R.string.location_notification_persistent_channel_name),
            NotificationManager.IMPORTANCE_DEFAULT);
    nc.setDescription(c.getString(R.string.location_notification_persistent_channel_description));
    nc.setGroup(NOTIFICATION_GROUP_ID);

    nc.setSound(null, null);

    nc.enableLights(false);
    nc.enableVibration(false);
    nc.setShowBadge(false);

    nm.createNotificationChannel(nc);
  }

  private static void createVisibleNotificationChannel(
          Context c, NotificationManager nm,
          String id, String name, String desc,
          long[] vibration) {
    // NotificationChannels are required for Notifications on O (API 26) and above.
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

    // Initializes NotificationChannel.
    NotificationChannel nc = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);
    nc.setDescription(desc);
    nc.setGroup(NOTIFICATION_GROUP_ID);

    nc.setSound(null, null);
    nc.enableLights(true);
    nc.enableVibration(true);
    nc.setShowBadge(true);

    nc.setLightColor(c.getColor(R.color.primary_color));
    nc.setVibrationPattern(vibration);

    nm.createNotificationChannel(nc);
  }

  private static void createOnEnterNotificationChannel(Context c, NotificationManager nm) {
    createVisibleNotificationChannel(
            c, nm,
            NOTIFICATION_ON_ENTER_ID,
            c.getString(R.string.location_notification_on_enter_channel_name),
            c.getString(R.string.location_notification_on_enter_channel_description),
            VIBRATION_ON_ENTER
    );
  }

  private static void createOnExitNotificationChannel(Context c, NotificationManager nm) {
    createVisibleNotificationChannel(
            c, nm,
            NOTIFICATION_ON_EXIT_ID,
            c.getString(R.string.location_notification_on_exit_channel_name),
            c.getString(R.string.location_notification_on_exit_channel_description),
            VIBRATION_ON_EXIT
    );
  }

  private static void createOnCompleteNotificationChannel(Context c, NotificationManager nm) {
    createVisibleNotificationChannel(
            c, nm,
            NOTIFICATION_ON_COMPLETE_ID,
            c.getString(R.string.location_notification_on_complete_channel_name),
            c.getString(R.string.location_notification_on_complete_channel_description),
            VIBRATION_ON_COMPLETE
    );
  }

  private static NotificationCompat.Builder createBaseBuilder(
          Context c, String channelId, PendingIntent onClick, PendingIntent onExit, PendingIntent onRefresh) {
    return new NotificationCompat.Builder(c, channelId)
            .setContentTitle(c.getText(R.string.location_notification_default_title))
            .setContentText(c.getText(R.string.location_notification_default_text))

            .setContentIntent(onClick)
            .addAction(0, c.getString(R.string.location_notification_refresh), onRefresh)
            .addAction(0, c.getString(R.string.location_notification_exit), onExit)

            .setSmallIcon(R.drawable.location_notification_icon)
            .setColor(ContextCompat.getColor(c, R.color.primary_color))
            .setColorized(true)
            .setSound(null);
  }

  NotificationCompat.Builder createPersistentNotification() {
    return createBaseBuilder(c, NOTIFICATION_PERSISTENT_ID, onClick, onExit, onRefresh)
            .setDefaults(0)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVibrate(null)
            .setOnlyAlertOnce(true);
  }

  private static NotificationCompat.Builder createVisibleBuilder(
          Context c, String channelId,
          PendingIntent onClick, PendingIntent onExit, PendingIntent onRefresh,
          long[] vibration
  ) {
    return createBaseBuilder(c, channelId, onClick, onExit, onRefresh)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(vibration)
            .setOnlyAlertOnce(false);
  }

  NotificationCompat.Builder createOnEnterNotification() {
    return createVisibleBuilder(c, NOTIFICATION_ON_ENTER_ID, onClick, onExit, onRefresh, VIBRATION_ON_ENTER);
  }

  NotificationCompat.Builder createOnExitNotification() {
    return createVisibleBuilder(c, NOTIFICATION_ON_EXIT_ID, onClick, onExit, onRefresh, VIBRATION_ON_EXIT);
  }

  NotificationCompat.Builder createOnCompleteNotification() {
    return createVisibleBuilder(c, NOTIFICATION_ON_COMPLETE_ID, onClick, onExit, onRefresh, VIBRATION_ON_COMPLETE);
  }

  void createChannels() {
    NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
    if (nm == null) throw new RuntimeException("Notification Manager is null.");

    createChannelGroup(c, nm);
    createPersistentNotificationChannel(c, nm);
    createOnEnterNotificationChannel(c, nm);
    createOnExitNotificationChannel(c, nm);
    createOnCompleteNotificationChannel(c, nm);
  }
}
