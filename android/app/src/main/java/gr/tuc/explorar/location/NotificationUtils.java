package gr.tuc.explorar.location;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;

import gr.tuc.explorar.R;

/**
 * Simplifies common {@link Notification} tasks.
 */
public class NotificationUtils {

  private static final String LOCATION_NOTIFICATION_CHANNEL_ID = "location_notification_channel";

  public static String createNotificationChannel(
          Context context) {

    // NotificationChannels are required for Notifications on O (API 26) and above.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      // The id of the channel.
      String channelId = LOCATION_NOTIFICATION_CHANNEL_ID;

      // The user-visible name of the channel.
      CharSequence channelName = context.getString(R.string.location_notification_channel_name);
      // The user-visible description of the channel.
      String channelDescription = context.getString(R.string.location_notification_channel_description);
      int channelImportance = NotificationManager.IMPORTANCE_DEFAULT;
      boolean channelEnableVibrate = false;
      int channelLockscreenVisibility = Notification.VISIBILITY_PUBLIC;

      // Initializes NotificationChannel.
      NotificationChannel notificationChannel =
              new NotificationChannel(channelId, channelName, channelImportance);
      notificationChannel.setDescription(channelDescription);
      notificationChannel.enableVibration(channelEnableVibrate);
      notificationChannel.setLockscreenVisibility(channelLockscreenVisibility);

      // Adds NotificationChannel to system. Attempting to create an existing notification
      // channel with its original values performs no operation, so it's safe to perform the
      // below sequence.
      NotificationManager notificationManager =
              (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
      if (notificationManager != null) {
        notificationManager.createNotificationChannel(notificationChannel);
      } else {
        throw new RuntimeException("Notification Manager is null!");
      }

      return channelId;
    } else {
      // Returns null for pre-O (26) devices.
      return null;
    }
  }
}
