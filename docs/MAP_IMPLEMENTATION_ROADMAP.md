# G-Rides Map Implementation Roadmap

This document is the implementation plan for maps, location search, nearby
vehicles, routing, and live provider tracking in G-Rides. It separates work we
can complete with frontend mocks from work that requires backend and Google
Maps Platform services.

## Goals

- Display a fast, branded map on iOS and Android.
- Show the customer's current location and nearby rentable vehicles.
- Search for locations with relevant suggestions.
- Display routes, distance, and traffic-aware ETA.
- Track a chauffeur or delivery provider smoothly during an active booking.
- Protect private vehicle and customer location data.
- Keep Google API keys, request volume, and billing under control.
- Allow the frontend to be built and tested before the backend is available.

## Technology decisions

### Mobile application

- `react-native-maps` for native map rendering, markers, polylines, regions,
  and Google Maps styling.
- Google Maps Platform as the consistent map provider on iOS and Android.
- `expo-location` for foreground and background GPS readings.
- `expo-task-manager` for background provider-location tasks.
- `socket.io-client` for live booking-specific location events.
- TanStack Query for REST data, caching, cancellation, retry policies, and
  loading/error states.
- React Native Animated or Reanimated for smooth marker movement and map UI
  transitions.

### Google Maps Platform

- Maps SDK for iOS and Maps SDK for Android for the base map.
- Places API (New) Autocomplete for search suggestions.
- Place Details API (New) for coordinates and formatted information after a
  suggestion is selected.
- Geocoding API primarily for reverse-geocoding raw GPS coordinates.
- Routes API for polylines, distance, and traffic-aware ETA.

### Backend and infrastructure

- Socket.IO server for live events and booking-specific rooms.
- PostgreSQL with PostGIS for authoritative vehicle locations, radius queries,
  viewport queries, and geospatial indexing.
- Redis for the latest provider position, short-lived location state, Socket.IO
  scaling, and expiration of stale providers.
- An authenticated backend proxy for Places, Geocoding, and Routes requests.

## Proposed architecture

```text
Provider phone
  -> expo-location
  -> authenticated backend location event
  -> validation and stale-event rejection
  -> Redis latest position with TTL
  -> Socket.IO room: booking:{bookingId}
  -> customer's animated map marker

Vehicle database
  -> PostgreSQL/PostGIS
  -> nearby/viewport query
  -> REST API
  -> TanStack Query
  -> map markers and vehicle cards

Customer search
  -> G-Rides backend proxy
  -> Places Autocomplete (New)
  -> Place Details (New)
  -> selected coordinates
  -> map camera and nearby vehicle query

Active route
  -> G-Rides backend proxy
  -> Routes API
  -> encoded polyline, distance, and ETA
  -> route state
  -> map polyline and booking UI
```

## Frontend data-source boundary

Screens and map components must not call Google or Socket.IO directly. They
should depend on typed services so mock implementations can be replaced by real
ones later.

The boundary should cover operations equivalent to:

```ts
type Coordinate = {
  latitude: number;
  longitude: number;
};

type Viewport = {
  northEast: Coordinate;
  southWest: Coordinate;
};

interface MapRepository {
  getNearbyVehicles(
    viewport: Viewport,
    filters: VehicleFilters,
  ): Promise<VehicleMapMarker[]>;
  searchPlaces(query: string, sessionToken: string): Promise<PlaceSuggestion[]>;
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;
  reverseGeocode(coordinate: Coordinate): Promise<ResolvedAddress>;
  getRoute(request: RouteRequest): Promise<RouteResult>;
}

interface LiveLocationRepository {
  connect(accessToken: string): Promise<void>;
  subscribeToBooking(
    bookingId: string,
    onLocation: (location: ProviderLocation) => void,
  ): () => void;
  publishLocation(location: ProviderLocation): Promise<void>;
  disconnect(): void;
}
```

During frontend development these interfaces will use local mock data,
simulated latency, and timed coordinate updates. Backend implementations can be
introduced without changing screen components.

## Implementation order

### Phase 0 — Project and configuration foundation

- [x] Install Expo-compatible `react-native-maps` and `expo-location` versions
  with `npx expo install`.
- [ ] Install `expo-task-manager` when background tracking work begins.
- [ ] Install TanStack Query before connecting REST endpoints.
- [x] Add iOS and Android foreground-location permission descriptions.
- [ ] Define separate development, staging, and production configuration.
- [ ] Create separate Google Maps keys for iOS, Android, and backend services.
- [ ] Restrict mobile keys by bundle identifier/package and API.
- [ ] Restrict the backend key by service and server/network policy.
- [ ] Never place the backend Routes, Places, or Geocoding key in the app.
- [ ] Add Google billing budgets, quotas, and usage alerts.
- [ ] Decide the Google Cloud Map ID and branded light/dark map styles.

**Exit criteria:** A basic map renders on both platforms, location permission
copy is configured, and no unrestricted production key exists.

### Phase 1 — Domain models and mock repositories

- [x] Define initial shared types for coordinates and vehicles; extend them with
  regions, viewports,
  filters, place suggestions, route results, and provider updates.
- [ ] Add typed `MapRepository` and `LiveLocationRepository` contracts.
- [x] Create deterministic mock vehicle data around Douala.
- [ ] Create mock location suggestions and place details.
- [x] Create a frontend-only mock route polyline between the customer's current
  coordinate and the selected vehicle.
- [ ] Create a simulated live-location stream that follows a known path.
- [ ] Add controllable mock latency and error states.
- [ ] Keep mock data outside screen components.

**Exit criteria:** Every planned frontend state can be demonstrated without a
backend or paid Google web-service request.

### Phase 2 — Home screen map experience

- [x] Recreate the Home screen header, search field, filters, vehicle cards,
  recommendations, and safe-area bottom navigation.
- [x] Add the embedded nearby-cars map card from the design.
- [x] Render the customer marker and mock nearby vehicle markers.
- [x] Add custom marker assets that remain legible at small sizes.
- [x] Present vehicles in blue, anchored map-pin frames with an image-failure
  fallback.
- [x] Keep custom markers live through image/style loading, then freeze their
  native snapshots to prevent intermittent blank markers without wasting map
  rendering work.
- [x] Keep vehicle cards and markers synchronized when one is selected.
- [x] Animate the camera to a selected vehicle.
- [x] Separate embedded-map gesture activation from full-screen camera behavior.
- [ ] Add loading, empty, permission-denied, and map-error states.
- [x] Make the map card's “Open map” action navigate to a full-screen map.
- [ ] Keep exact private vehicle positions approximate until product rules allow
  them to be revealed.

**Exit criteria:** The Home screen matches the supplied design and behaves
realistically using mock vehicles.

### Phase 3 — Foreground customer location

- [ ] Explain why location is useful before requesting permission.
- [x] Request foreground permission only when the feature needs it.
- [x] Read the last known position first for a fast initial render.
- [x] Request a fresher position without blocking the screen indefinitely.
- [x] Center the map on the customer when permission is granted.
- [x] Provide a useful Douala fallback region when permission is denied.
- [ ] Add a “locate me” control.
- [ ] Respond to approximate-location accuracy correctly.
- [ ] Stop foreground subscriptions when their screen no longer needs them.

**Exit criteria:** The map loads quickly with granted, denied, approximate, and
temporarily unavailable location states.

### Phase 4 — Full-screen map and frontend-only live simulation

- [x] Build the initial full-screen map; expandable/collapsible vehicle details
  remain pending.
- [x] Add current-location, recenter, and filter controls.
- [x] Add a frontend-only location search using the device geocoder; replace it
  with the debounced Places-backed flow in Phase 6 when the backend is ready.
- [ ] Query the mock repository when the visible region changes.
- [ ] Debounce viewport changes so panning does not cause excessive requests.
- [ ] Smoothly animate vehicle/provider markers between coordinates.
- [ ] Ignore older sequence numbers in the simulated stream.
- [ ] Display a stale-location indicator when updates stop.
- [ ] Add marker clustering or server-side viewport limiting if marker density
  becomes high.
- [ ] Verify that map movement does not rerender the whole Home screen.

**Exit criteria:** The simulated live map looks smooth and remains responsive
on a physical iPhone and a representative Android device.

### Phase 5 — Backend nearby-vehicle integration

- [ ] Create a nearby-vehicles endpoint accepting radius, viewport, filters,
  pagination, and sort rules.
- [ ] Add PostGIS geometry/geography columns and appropriate spatial indexes.
- [ ] Return only fields required by the map and summary cards.
- [ ] Connect the endpoint through the real `MapRepository`.
- [ ] Use TanStack Query caching and cancellation for viewport changes.
- [ ] Preserve previous results while a nearby viewport is loading.
- [ ] Add server-enforced maximum radius and result limits.
- [ ] Quantize or offset private vehicle coordinates where required.

**Exit criteria:** The frontend can switch between mock and real nearby-vehicle
repositories without screen changes.

### Phase 6 — Places search and address resolution

- [ ] Add a backend endpoint for Places Autocomplete (New).
- [ ] Debounce search input by approximately 300–400 ms.
- [ ] Cancel stale searches as the query changes.
- [ ] Generate one Places session token per search session.
- [ ] Bias results around the current map viewport or customer coordinate.
- [ ] Use Cameroon as the initial regional preference where appropriate.
- [ ] Request only necessary response fields.
- [ ] Call Place Details (New) after the user selects a prediction.
- [ ] Move the map camera to the selected coordinates.
- [ ] Use Geocoding for reverse lookup of raw GPS coordinates and as a defined
  address-entry fallback.
- [ ] Display required Google attribution.
- [ ] Respect Google Maps Platform storage and caching restrictions; persist
  Place IDs rather than unrestricted Google response content.

**Exit criteria:** Search is relevant, debounced, cancelable, correctly billed
as sessions, and does not expose a server API key.

### Phase 7 — Routes, distance, and ETA

- [ ] Add an authenticated backend route endpoint.
- [ ] Send coordinates or Place IDs rather than untrusted arbitrary Google
  requests.
- [ ] Use field masks to request only the polyline, distance, duration, and
  necessary route metadata.
- [ ] Decode and render route polylines on the map.
- [ ] Fit the map camera to the route with safe UI padding.
- [ ] Use `TRAFFIC_AWARE` for active driving ETAs where its cost is justified.
- [ ] Use traffic-unaware routes for low-priority previews where appropriate.
- [ ] Do not recalculate the route for every GPS event.
- [ ] Recalculate on assignment, destination change, meaningful off-route
  movement, or a controlled ETA refresh interval.
- [ ] Handle zero-route, quota, timeout, and degraded-network responses.

**Exit criteria:** Routes and ETAs are accurate enough for the supported Douala
service area and API traffic remains within the planned budget.

### Phase 8 — Real Socket.IO live tracking

- [ ] Authenticate the Socket.IO handshake with a short-lived user token.
- [ ] Authorize every booking-room subscription on the server.
- [ ] Use rooms such as `booking:{bookingId}` instead of global broadcasts.
- [ ] Publish latitude, longitude, accuracy, heading, speed, timestamp, sequence
  number, provider ID, and booking ID.
- [ ] Reject impossible, unauthorized, stale, or out-of-order updates.
- [ ] Add acknowledgement timeouts and bounded retries.
- [ ] Store the latest accepted position in Redis with a TTL.
- [ ] Fetch the latest snapshot after reconnecting.
- [ ] Enable connection-state recovery where supported, but still handle failed
  recovery with a full state refresh.
- [ ] Keep a REST snapshot fallback because Socket.IO delivery is at-most-once
  by default.
- [ ] Smooth marker movement between accepted server coordinates.
- [ ] Show reconnecting, stale, and offline states without misleading the user.
- [ ] Add Redis Streams or another compatible adapter when multiple Socket.IO
  instances are required and connection recovery must be retained.

**Exit criteria:** Temporary network loss, reconnection, duplicate events, and
out-of-order events do not leave the customer with an incorrect provider state.

### Phase 9 — Background provider tracking

- [ ] Create a custom Expo development build; background location is not
  supported by Expo Go on iOS.
- [ ] Define the location task at module scope with `expo-task-manager`.
- [ ] Request foreground permission before background permission.
- [ ] Request background access only when the provider starts an eligible active
  job and after explaining the need.
- [ ] Configure iOS background location and Android foreground-service details.
- [ ] Start tracking only for active delivery/chauffeur workflows.
- [ ] Stop tracking immediately when the eligible workflow ends.
- [ ] Use adaptive intervals based on movement, accuracy, app state, and battery.
- [ ] Begin testing with approximately 3–5 second or 10–20 metre updates during
  active movement, then tune using real-device measurements.
- [ ] Reduce or defer updates when stationary or backgrounded where appropriate.
- [ ] Queue a bounded number of unsent updates and discard stale samples.
- [ ] Ensure the user can see and control when background tracking is active.
- [ ] Add platform-specific tests for app backgrounding, termination, low-power
  mode, temporary permission, and revoked permission.

**Exit criteria:** Provider tracking is transparent, battery-conscious, policy
compliant, and reliable enough for an active booking on real devices.

### Phase 10 — Performance, privacy, and production hardening

- [ ] Measure Home render time, map FPS, marker update cost, memory, and battery.
- [ ] Memoize markers and avoid replacing unchanged marker arrays.
- [ ] Limit results to the visible region and a sensible maximum count.
- [ ] Avoid high-frequency React state updates for raw GPS samples.
- [ ] Add server-side rate limits and anomaly detection.
- [ ] Add observability for permission failures, Google API errors, socket
  reconnects, stale providers, and route latency.
- [ ] Define location retention and deletion rules.
- [ ] Do not retain full movement history unless the product and legal basis
  require it.
- [ ] Encrypt transport and sensitive stored location data.
- [ ] Add publicly accessible Terms of Use and Privacy Policy as required.
- [ ] Verify Google logo and attribution placement.
- [ ] Field-test Maps, Places, Geocoding, Routes, and traffic quality throughout
  the actual Douala service area.
- [ ] Load-test nearby queries and Socket.IO rooms before launch.
- [ ] Configure graceful fallbacks for Google or backend outages.

**Exit criteria:** The live map meets agreed performance and reliability targets
without exposing private location data or unrestricted API credentials.

## What can be built without a backend

The following work can proceed immediately:

- The complete Home screen and full-screen map UI.
- Current foreground device location and permission handling.
- Custom vehicle and customer markers.
- Map filters, camera controls, selection, and synchronized vehicle cards.
- Search UI using mock suggestions.
- Route polyline UI using mock route data.
- Live marker animation using a simulated coordinate stream.
- Loading, empty, offline, denied-permission, stale-location, and error states.
- Typed repositories and hooks that will later call the real backend.
- Responsive and physical-device performance testing.

The following require backend or external-service integration:

- Real nearby-vehicle queries.
- Real Places suggestions and Place Details.
- Real reverse geocoding.
- Traffic-aware routes and ETA.
- Authorized Socket.IO booking rooms.
- Redis-backed latest positions and recovery.
- Persistent PostGIS spatial queries.
- Production background-provider tracking and server delivery.

## Recommended first frontend milestone

1. Install `react-native-maps` and `expo-location` with Expo's installer.
2. Create the map domain types and mock repository.
3. Build the supplied Home screen with realistic mock vehicle data.
4. Add the embedded nearby-cars map and full-screen map navigation.
5. Add foreground customer location with permission and fallback states.
6. Add simulated live markers and mock search/route states.
7. Validate on the user's physical iPhone before backend integration begins.

## Reference documentation

- [Expo SDK 54: react-native-maps](https://docs.expo.dev/versions/v54.0.0/sdk/map-view/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Maps Platform security guidance](https://developers.google.com/maps/api-security-best-practices)
- [Places Autocomplete (New)](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete)
- [Google Routes traffic options](https://developers.google.com/maps/documentation/routes/traffic-opt)
- [Socket.IO delivery guarantees](https://socket.io/docs/v4/delivery-guarantees)
- [Socket.IO connection-state recovery](https://socket.io/docs/v4/connection-state-recovery)
