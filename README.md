<!-- ![Logo](art/export/350ppi/Logo%20On%20Dark.png) -->
<img src="art/logo.png" alt="Logo" width="500"/>

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

By combining the above mechanics with a narrative structure and cooperating with local businesses to create waypoints treasure hunts or other publicity events could be organized.
Furthermore, the app can easily be reskinned to remove the zombie theme and change it to
say, a pirate theme.

## Tech Stack
This app is written in Typescript and based on the React Native framework.
It combines Redux, React, and redux Sagas in order to form the Model, View, and controller
of an MVC architecture.
Redux sagas handles the business logic of the app, communicating with the native code,
fetching data from APIs, and allowing the app to have a linear flow of complex logic without needing a backend service.
Apart from the Places API, the app acts completely independently without needing a backend server.
It can easily be expanded to include more complex and sequential tasks for the user, by
handling more complex logic easily.

### Location
In addition, this contains a background service which would be impossible to create 
in React Native.
This service was written using native code and uses the Fused Location Provider in Google APIs
in order to track the location of the user in both foreground and background without using
a lot of battery life.

It does this by using the following assumption: if the user is X away from the closest target, then it will take him at least Y to reach it.
Therefore, we can wait at least Y before rechecking his location.
Furthermore, if Y and X are large enough, we can instruct the API
to geofence the user (create a barrier around him and notify us when he leaves it).
That way we can completely stop location checks and battery drain if, say, he sits in a table.
The fused location provider will then monitor the user using an accelerometer, which is very
battery efficient.

Sounds simple, but since the above code acts independently of React (JS doesn't run
in the background), and it depends on knowing and acting on the Points of Interest of the user, it wasn't as simple as setting a bunch of callbacks on the Google APIs.
A part of the model had to be ported to native code and the redux Sagas have to parcel and pass the user's points to it when the app closes to the native code.
Then, the native code uses its own business logic to decide when the user is close to a point of
interest and enters it.
It saves all the progress the user completes in the background (to the second) and when the 
app returns to the foreground it passes it to React.
It also persists its data itself before passing it on.
That way, if the OS garbage collects our service, the user's progress is preserved and the 
background service can be woken up on its own again without invoking any JS code.

## UI Overview
### Intro
When the app loads it presents a gorgeous full screen splash screen with the logo properly sized.
Part of it had to be written in native XML because React Native didn't (maybe still doesn't) have built
in splash screens.

Then, the user is presented with a short introduction to the App and prompted to accept a location permission.
The background feature works regardless of whether he chooses "Allow all the time" or "Allow only while using
the app" because it was created as a foreground service.
That's also really important since both Google and Apple are cracking down in background location fetching
and the location features are crippled otherwise (running as a background and not foreground service).
Sadly, that also means that the service has to be started while the app is running, so the user has to initiate it.
But for the use case of this App it is acceptable.

<img src="art/img/0_loading.jpg" alt="Logo" width="260"/> <img src="art/img/1_intro.jpg" alt="Logo" width="260"/> <img src="art/img/2_permissions.jpg" alt="Logo" width="260"/>
