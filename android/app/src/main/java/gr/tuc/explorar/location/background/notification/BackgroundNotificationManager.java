package gr.tuc.explorar.location.background.notification;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.res.Resources;
import android.text.Html;

import androidx.core.app.NotificationManagerCompat;
import androidx.core.text.HtmlCompat;

import gr.tuc.explorar.R;
import gr.tuc.explorar.location.background.model.ParcelablePoint;

import static androidx.core.text.HtmlCompat.FROM_HTML_MODE_LEGACY;

/**
 * Simplifies common {@link Notification} tasks.
 */
public class BackgroundNotificationManager {

  private static final int LOCATION_NOTIFICATION_ID = 345657543;

  private BackgroundNotificationBuilder builder;
  private NotificationManagerCompat nm;
  private Context c;
  private Resources r;

  public BackgroundNotificationManager(Context c,
                                       PendingIntent onClick,
                                       PendingIntent onExit,
                                       PendingIntent onRefresh) {
    nm = NotificationManagerCompat.from(c);
    builder = new BackgroundNotificationBuilder(c, onClick, onRefresh, onExit);
    builder.createChannels();
    this.c = c;
    this.r = c.getResources();
  }

  public void startForeground(Service service) {
    service.startForeground(
            LOCATION_NOTIFICATION_ID,
            builder.createPersistentNotification().build());
  }

  public void setClosestPoint(ParcelablePoint p, double distance) {
    nm.notify(LOCATION_NOTIFICATION_ID,
            builder.createPersistentNotification()
                    .setContentTitle(p.name)
                    .setContentText(HtmlCompat.fromHtml(c.getString(
                            R.string.location_notification_closest_point,
                            distance,
                            "NW",
                            p.desc
                    ), FROM_HTML_MODE_LEGACY))
                    .setOnlyAlertOnce(false)
                    .build());

  }
}
