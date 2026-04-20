import { BRAZIL_STATES } from '../data/brazilCities';

export function getBrazilState(uf?: string) {
  return BRAZIL_STATES.find((state) => state.uf === uf);
}

export function getCitiesForState(uf?: string) {
  return getBrazilState(uf)?.cities ?? [];
}

export function formatLocationLabel(location: { city?: string; state?: string; locationLabel?: string }) {
  if (location.locationLabel) {
    return location.locationLabel;
  }
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  return location.city ?? location.state;
}
