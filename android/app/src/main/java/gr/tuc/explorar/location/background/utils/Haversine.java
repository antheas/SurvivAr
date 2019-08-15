package gr.tuc.explorar.location.background.utils;

/**
 * Jason Winn
 * http://jasonwinn.org
 * Created July 10, 2013
 *
 * Description: Small class that provides approximate distance between
 * two points using the Haversine formula.
 *
 * Call in a static context:
 * Haversine.distance(47.6788206, -122.3271205,
 *                    47.6788206, -122.5271205)
 * --> 14.973190481586224 [km]
 *
 * https://github.com/jasonwinn/haversine/blob/master/Haversine.java
 * FIXME: License not available.
 */

public class Haversine {
  private static final int EARTH_RADIUS = 6371; // Approx Earth radius in KM

  public static double distance(double startLat, double startLong,
                                double endLat, double endLong) {

    double dLat  = Math.toRadians((endLat - startLat));
    double dLong = Math.toRadians((endLong - startLong));

    startLat = Math.toRadians(startLat);
    endLat   = Math.toRadians(endLat);

    double a = haversin(dLat) + Math.cos(startLat) * Math.cos(endLat) * haversin(dLong);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c; // <-- d
  }

  public static double haversin(double val) {
    return Math.pow(Math.sin(val / 2), 2);
  }

  // Finds the bearing between two points
  // https://stackoverflow.com/questions/8123049/calculate-bearing-between-two-locations-lat-long
  public static double bearing(double startLat, double startLon,
                               double endLat, double endLong) {
    double dLon = (endLong-startLon);
    double y = Math.sin(dLon) * Math.cos(endLat);
    double x = Math.cos(startLat)*Math.sin(endLat) - Math.sin(startLat)*Math.cos(endLat)*Math.cos(dLon);
    double brng = Math.toDegrees((Math.atan2(y, x)));
    return (360 - ((brng + 360) % 360));
  }
}