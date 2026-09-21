import type { Coordinate } from '../types/map';

export type RoutePreview = {
  coordinates: Coordinate[];
  distanceMeters: number;
  durationMinutes: number;
  instruction: string;
  instructionDistanceMeters: number;
  source: 'preview';
};

type RoutePreviewRequest = {
  destination: Coordinate;
  origin: Coordinate;
};

const EARTH_RADIUS_METERS = 6_371_000;

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceBetween(start: Coordinate, end: Coordinate) {
  const latitudeDelta = degreesToRadians(end.latitude - start.latitude);
  const longitudeDelta = degreesToRadians(end.longitude - start.longitude);
  const startLatitude = degreesToRadians(start.latitude);
  const endLatitude = degreesToRadians(end.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function createPreviewCoordinates(
  origin: Coordinate,
  destination: Coordinate,
) {
  const latitudeDelta = destination.latitude - origin.latitude;
  const longitudeDelta = destination.longitude - origin.longitude;
  const bendStrength = 0.14;
  const points = 18;

  return Array.from({ length: points }, (_, index) => {
    const progress = index / (points - 1);
    const bend = Math.sin(Math.PI * progress) * bendStrength;

    return {
      latitude:
        origin.latitude + latitudeDelta * progress - longitudeDelta * bend,
      longitude:
        origin.longitude + longitudeDelta * progress + latitudeDelta * bend,
    };
  });
}

/**
 * Frontend-only route adapter. It deliberately has the same asynchronous shape
 * as the future backend Routes API call, so the map component will not need to
 * change when road-following route coordinates become available.
 */
export async function getRoutePreview({
  destination,
  origin,
}: RoutePreviewRequest): Promise<RoutePreview> {
  const coordinates = createPreviewCoordinates(origin, destination);
  const distanceMeters = Math.max(
    1,
    Math.round(
      coordinates.slice(1).reduce(
        (distance, coordinate, index) =>
          distance + distanceBetween(coordinates[index], coordinate),
        0,
      ),
    ),
  );
  const durationMinutes = Math.max(
    3,
    Math.ceil((distanceMeters / 1000 / 22) * 60),
  );

  return {
    coordinates,
    distanceMeters,
    durationMinutes,
    instruction: 'Continue toward the vehicle',
    instructionDistanceMeters: Math.min(200, Math.max(50, distanceMeters)),
    source: 'preview',
  };
}
