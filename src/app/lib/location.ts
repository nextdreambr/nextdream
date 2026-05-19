export { getBrazilState, getCitiesForState } from '../data/brazilCities';

export function formatLocationLabel(location: { city?: string; state?: string; locationLabel?: string }) {
  if (location.locationLabel) {
    return location.locationLabel;
  }
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  return location.city ?? location.state;
}
