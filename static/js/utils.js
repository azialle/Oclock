import { Vector3 } from "https://esm.sh/three";
import * as solar from "https://esm.sh/solar-calculator";

export const calculateSunPosition = (date) => {
  const dayStart = new Date(+date).setUTCHours(0, 0, 0, 0);
  const centuryT = solar.century(date);
  const longitude = ((dayStart - date) / 864e5) * 360 - 180;
  
  const lon = longitude - solar.equationOfTime(centuryT) / 4;
  const lat = solar.declination(centuryT);

  const phi = lon * (Math.PI / 180);
  const theta = lat * (Math.PI / 180);

  return new Vector3(
    Math.cos(theta) * Math.sin(phi),
    Math.sin(theta),
    Math.cos(theta) * Math.cos(phi)
  );
};

export const mapFeatureToLabel = (feature) => ({
  lat: feature.properties.latitude,
  lng: feature.properties.longitude,
  name: feature.properties.ADMIN,
  tz: feature.properties.iana_tz,
});