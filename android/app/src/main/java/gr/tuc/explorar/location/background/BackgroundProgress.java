package gr.tuc.explorar.location.background;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class BackgroundProgress {

  private Map<String, Double> progress;

  public BackgroundProgress(ParcelablePoint[] points) {
    // Create initial progress
    progress = new HashMap<>();
    for (ParcelablePoint point : points) {
      progress.put(point.id, point.completedDuration);
    }
  }

  private BackgroundProgress(Map<String, Double> progress) {
    this.progress = progress;
  }

  public void update(String id, double newDuration) {
    progress.put(id, newDuration);
  }

  public void update(ParcelablePoint point, double newDuration) {
    update(point.id, newDuration);
  }

  public double get(String id) {
    return progress.get(id);
  }

  public double get(ParcelablePoint point) {
    return get(point.id);
  }

  public Set<String> getIds() {
    return progress.keySet();
  }

  public String stringify() {
    StringBuilder sb = new StringBuilder();

    for (String id : progress.keySet()) {
      // Encode id to be able to use separator chars > &
      String encodedId = encodeId(id);
      String durationHex = Double.toHexString(get(id));

      sb.append(encodedId);
      sb.append('>');
      sb.append(durationHex);
      sb.append('&');
    }
    // Remove last separator
    sb.setLength(sb.length() - 1);

    return sb.toString();
  }

  public static BackgroundProgress unstringify(String data) {
    String[] stringPoints = data.split("&");

    Map<String, Double> progressMap = new HashMap<>();
    for (String stringPoint : stringPoints) {
      String[] point = stringPoint.split(">");
      String id = decodeId(point[0]);
      double progress = Double.valueOf(point[2]);

      progressMap.put(id, progress);
    }

    return new BackgroundProgress(progressMap);
  }

  private static String encodeId(String id) {
    id = id.replace("&", "&amp;");
    id = id.replace(">", "&gt;");
    return id;
  }

  private static String decodeId(String id) {
    id = id.replace("&amp;", "&");
    id = id.replace("&gt;", ">");
    return id;
  }
}
