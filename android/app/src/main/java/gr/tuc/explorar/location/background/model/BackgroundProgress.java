package gr.tuc.explorar.location.background.model;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class BackgroundProgress {

  // Initial is kept separate so only the changed progress will
  // be retained
  private Map<String, Double> initial;
  private Map<String, Double> progress;

  public BackgroundProgress(@NonNull List<ParcelPoint> points) {
    initial = parsePoints(points);
    progress = new HashMap<>();
  }

  public BackgroundProgress(@Nonnull String data) {
    initial = new HashMap<>();
    progress = parseString(data);
  }

  public BackgroundProgress(@Nonnull List<ParcelPoint> points, @Nullable String data) {
    initial = parsePoints(points);
    progress = data == null ? new HashMap<>() : parseString(data);
  }

  public void update(String id, double newDuration) {
    progress.put(id, newDuration);
  }

  public void update(ParcelPoint point, double newDuration) {
    update(point.id, newDuration);
  }

  public double get(String id) {
    Double p;
    if (progress.containsKey(id))
      p = progress.get(id);
    else
      p = initial.get(id);

    if (p == null) return 0;
    return p;
  }

  public double get(ParcelPoint point) {
    return get(point.id);
  }

  public void add(ParcelPoint point, double addedTime) {
    update(point, get(point) + addedTime);
  }

  public Set<String> getIds() {
    return progress.keySet();
  }

  private static Map<String, Double> parseString(String data) {
    String[] stringPoints = data.split("&");

    Map<String, Double> progressMap = new HashMap<>();
    for (String stringPoint : stringPoints) {
      if("".equals(stringPoint)) continue;
      String[] point = stringPoint.split(">");
      String id = decodeId(point[0]);
      double progress = Double.valueOf(point[1]);

      progressMap.put(id, progress);
    }

    return progressMap;
  }

  private static Map<String, Double> parsePoints(List<ParcelPoint> points) {
    Map<String, Double> initialMap = new HashMap<>();

    for (ParcelPoint point : points) {
      if (point.isWaitPoint)
        initialMap.put(point.id, point.completedDuration);
    }

    return initialMap;
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
    if (sb.length() > 0) sb.setLength(sb.length() - 1);

    return sb.toString();
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
