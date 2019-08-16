package gr.tuc.explorar.location.background.notification;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.text.Spanned;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.text.HtmlCompat;

import java.util.List;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import gr.tuc.explorar.R;
import gr.tuc.explorar.location.background.model.ParcelPoint;

/**
 * Contains the logic for creating notifications.
 */
public class BackgroundNotificationManager {

  private static final int LOCATION_NOTIFICATION_ID = 345657543;

  private BackgroundNotificationBuilder builder;
  private NotificationManagerCompat nm;
  private Context c;

  public BackgroundNotificationManager(Context c,
                                       PendingIntent onClick,
                                       PendingIntent onExit,
                                       PendingIntent onRefresh) {
    nm = NotificationManagerCompat.from(c);
    builder = new BackgroundNotificationBuilder(c, onClick, onRefresh, onExit);
    builder.createChannels();
    this.c = c;
  }

  public void startForeground(Service service) {
    service.startForeground(
            LOCATION_NOTIFICATION_ID,
            builder.createPersistentNotification().build());
  }

  public void updateNotification(
          @Nullable ParcelPoint.Metadata closestPoint,
          @Nullable ParcelPoint.Metadata closestWaitPoint,
          @Nonnull List<ParcelPoint> completedPoints,
          int event) {

    // Get proper builder
    NotificationCompat.Builder base;
    switch (event) {
      case ParcelPoint.ON_COMPLETE:
        base = builder.createOnCompleteNotification();
        break;
      case ParcelPoint.ON_ENTER:
        base = builder.createOnEnterNotification();
        break;
      case ParcelPoint.ON_EXIT:
        base = builder.createOnExitNotification();
        break;
      case ParcelPoint.DEFAULT:
        // fallthrough
      default:
        base = builder.createPersistentNotification();
        break;
    }

    NotificationCompat.InboxStyle style = new NotificationCompat.InboxStyle();
    boolean usesStyle = false;

    // Create notification content
    if (closestPoint == null) {
      // No points left
      base.setContentTitle(formatString(R.string.location_notification_no_points_title));
      base.setContentText(formatString(R.string.location_notification_point_text));
    } else {
      ParcelPoint.Metadata firstPoint;
      ParcelPoint.Metadata expandedPoint;

      // We have a point available
      if (closestWaitPoint == null || closestWaitPoint.point.id.equals(closestPoint.point.id)) {
        // If the wait point is null or the same point as the closest one ignore it.
        firstPoint = closestPoint;
        expandedPoint = null;
      } else if (closestWaitPoint.userWithin) {
        // If we are in the wait point then show it first since the user will be completing it,
        // even if it is further than the closest point.
        firstPoint = closestWaitPoint;
        expandedPoint = closestPoint;
      } else {
        // Normal order
        firstPoint = closestPoint;
        expandedPoint = closestWaitPoint;
      }

      // Setup the notification
      Spanned title = formatString(
              R.string.location_notification_point_title,
              firstPoint.distance,
              firstPoint.point.radius,
              azimuthToBearing(firstPoint.bearing),
              firstPoint.point.name
      );
      Spanned text;
      if (firstPoint.point.isWaitPoint) {
        text = formatString(
                R.string.location_notification_wait_point_text,
                firstPoint.progress,
                firstPoint.point.duration,
                firstPoint.point.desc
        );
      } else {
        text = formatString(
                R.string.location_notification_point_text,
                firstPoint.point.desc
        );
      }
      base.setContentTitle(title);
      base.setContentText(text);
      style.setSummaryText(text);
      style.addLine(text);

      // Setup subtext
      if (firstPoint.userWithin) {
        if (firstPoint.point.isWaitPoint) {
          base.setProgress(
                  (int) Math.floor(firstPoint.point.duration),
                  (int) Math.floor(firstPoint.progress),
                  false
          );
        } else {
          base.setSubText(formatString(R.string.location_notification_in_point_subtext));
        }
      } else {
        if (firstPoint.point.isWaitPoint) {
          base.setSubText(formatString(R.string.location_notification_wait_point_subtext));
        } else {
          base.setSubText(formatString(R.string.location_notification_point_subtext));
        }
      }

      // Setup secondary point
      if (expandedPoint != null) {
        usesStyle = true;
        if (expandedPoint.point.isWaitPoint) {
          style.addLine(formatString(
                  R.string.location_notification_wait_point,
                  expandedPoint.distance,
                  expandedPoint.point.radius,
                  azimuthToBearing(expandedPoint.bearing),
                  expandedPoint.point.name,
                  expandedPoint.progress,
                  expandedPoint.point.duration
          ));
        } else {
          style.addLine(formatString(
                  R.string.location_notification_point,
                  expandedPoint.distance,
                  expandedPoint.point.radius,
                  azimuthToBearing(expandedPoint.bearing),
                  expandedPoint.point.name
          ));
        }
      }
    }

    // Setup completed points
    for (ParcelPoint p : completedPoints) {
      usesStyle = true;
      style.addLine(formatString(
              R.string.location_notification_completed_point,
              p.name,
              p.duration,
              p.duration
      ));
    }

    if (usesStyle) base.setStyle(style);
    nm.notify(LOCATION_NOTIFICATION_ID, base.build());
  }

  private Spanned formatString(int id, Object... varargs) {
    return HtmlCompat.fromHtml(c.getString(id, varargs), HtmlCompat.FROM_HTML_MODE_LEGACY);
  }

  private static String azimuthToBearing(double azimuth) {
    int multiple = (int) Math.round(azimuth / 45) % 8;

    switch (multiple) {
      case 0:
        return "N";
      case 1:
        return "NE";
      case 2:
        return "E";
      case 3:
        return "SE";
      case 4:
        return "S";
      case 5:
        return "SW";
      case 6:
        return "W";
      case 7:
        // fallthrough
      default:
        return "NW";
    }
  }
}
