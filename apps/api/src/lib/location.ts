type LocationParts = {
  city?: string;
  state?: string;
};

export function normalizeLocationPart(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildLocationLabel(location: LocationParts) {
  const city = normalizeLocationPart(location.city);
  const state = normalizeLocationPart(location.state);

  if (city && state) {
    return `${city}, ${state}`;
  }
  if (city) {
    return city;
  }
  return state;
}
