![Logo](art/export/350ppi/Logo%20On%20Dark.png)

# SurvivAr
A concept augmented reality app about fighting in a zombie apocalypse, based on Geolocation.
Sourcing data from the Google Places API, this app directs the user to visit pharmacies and
hotels in order to complete "survival" tasks.

Hotels allow the user to "rest", by waiting a certain amount of time within reach of the hotel.
Pharmacies allow the user to "scavenge" for resources, by displaying a map with waypoints on 
which the user can find products and scan their QR code (thereby "obtaining" them).
Also, the app features a background service which can run while the phone is on standby and point
him, with a notification, towards the right direction.
This background service was heavily optimized and runs on native code, ensuring the app will not
drain any battery life, even if it tracks the user for hours.

By combining the above mechanics with a narrative structure and cooperating with local businesses to create waypoints, treasure hunts or other publicity events could be organized.
Furthermore, the app can easily be reskinned to remove the zombie theme.