import { Vector3 } from "https://esm.sh/three";

export const GLOBE_CONFIG = {
  initialAltitude: () => {
    const aspect = window.innerWidth / window.innerHeight;
    if (window.innerWidth < 768) return aspect < 1 ? 4.0 : aspect > 0.7 && aspect < 1.3 ? 3.8 : 3.2;
    return 2.5;
  },
  selectionAltitude: () => (window.innerWidth < 768 ? 2.8 : 1.8),
  polygonAltitude: 0.012,
  autoRotateSpeed: 0.3,
  transitionDuration: 1000,
};

export const COLORS = {
  highlightCap: "rgba(93, 162, 255, 0.4)",
  defaultCap: "rgba(0, 0, 0, 0.0)",
  highlightStroke: "rgba(255, 255, 255, 0.8)",
  defaultStroke: "rgba(255, 255, 255, 0.1)",
};

export const DayNightShader = {
  uniforms: (dayTexture, nightTexture) => ({
    dayTexture: { value: dayTexture },
    nightTexture: { value: nightTexture },
    sunDirection: { value: new Vector3() },
  }),
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 sunDirection; 
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      float intensity = dot(normalize(vWorldPos), normalize(sunDirection));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      gl_FragColor = mix(nightColor, dayColor, smoothstep(-0.1, 0.1, intensity));
    }
  `,
};