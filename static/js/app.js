import { TextureLoader, ShaderMaterial } from "https://esm.sh/three";
import { GLOBE_CONFIG, COLORS, DayNightShader } from "./config.js";
import { calculateSunPosition, mapFeatureToLabel } from "./utils.js";
import { UIManager } from "./ui.js";

class GlobeApp {
  constructor(containerId) {
    this.world = Globe()(document.getElementById(containerId));
    this.state = {
      selected: null,
      hovered: null,
      showAllLabels: false,
      countries: []
    };
    this.material = null;
    this.init();
  }

  async init() {
    await this.loadAssets();
    this.setupGlobe();
    this.setupEventListeners();
    this.animate();
  }

  async loadAssets() {
    const loader = new TextureLoader();
    const [dayT, nightT, geoData] = await Promise.all([
      loader.loadAsync("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg"),
      loader.loadAsync("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"),
      fetch("static/data/countries_data.json").then((res) => res.json()),
    ]);

    this.state.countries = geoData.features;
    this.material = new ShaderMaterial({
      uniforms: DayNightShader.uniforms(dayT, nightT),
      vertexShader: DayNightShader.vertexShader,
      fragmentShader: DayNightShader.fragmentShader,
    });
  }

  setupGlobe() {
    this.world
      .globeMaterial(this.material)
      .backgroundImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png")
      .polygonsData(this.state.countries)
      .polygonGeoJsonGeometry((d) => d.geometry)
      .polygonAltitude(GLOBE_CONFIG.polygonAltitude)
      .polygonCapColor((d) => (d === this.state.hovered || d === this.state.selected ? COLORS.highlightCap : COLORS.defaultCap))
      .polygonStrokeColor((d) => (d === this.state.hovered || d === this.state.selected ? COLORS.highlightStroke : COLORS.defaultStroke))
      .pointOfView({ altitude: GLOBE_CONFIG.initialAltitude() })
      .onPolygonClick((d) => d && this.selectCountry(d))
      .onGlobeClick(() => this.resetView())
      .onPolygonHover((d) => {
        this.state.hovered = d;
        this.refresh();
      })
      .htmlElement((d) => UIManager.createCountryLabel(d));

    this.world.controls().autoRotate = true;
    this.world.controls().autoRotateSpeed = GLOBE_CONFIG.autoRotateSpeed;
    this.world.controls().addEventListener("start", () => this.clearSelectionState());
  }

  setupEventListeners() {
    window.addEventListener("resize", () => {
      this.world.width(window.innerWidth).height(window.innerHeight);
      if (!this.state.selected) this.world.pointOfView({ altitude: GLOBE_CONFIG.initialAltitude() }, 400);
    });

    UIManager.initSearch(this.state.countries, (m) => this.selectCountry(m));

    document.getElementById("labelToggle").addEventListener("change", (e) => {
      this.state.showAllLabels = e.target.checked;
      this.syncLabels();
    });
  }

  selectCountry(feature) {
    this.state.selected = feature;
    this.world.pointOfView(
      { 
        lat: feature.properties.latitude, 
        lng: feature.properties.longitude, 
        altitude: GLOBE_CONFIG.selectionAltitude() 
      },
      GLOBE_CONFIG.transitionDuration
    );
    this.refresh();
  }

  resetView() {
    this.state.selected = null;
    this.world.pointOfView({ altitude: GLOBE_CONFIG.initialAltitude() }, GLOBE_CONFIG.transitionDuration);
    this.refresh();
  }

  clearSelectionState() {
    if (this.state.selected) {
      this.state.selected = null;
      this.refresh();
    }
  }

  refresh() {
    this.world.polygonCapColor(this.world.polygonCapColor()).polygonStrokeColor(this.world.polygonStrokeColor());
    this.syncLabels();
  }

  syncLabels() {
    if (this.state.showAllLabels) {
      this.world.htmlElementsData(this.state.countries.map(mapFeatureToLabel));
    } else {
      const active = this.state.selected || (window.innerWidth > 768 ? this.state.hovered : null);
      this.world.htmlElementsData(active ? [mapFeatureToLabel(active)] : []);
    }
  }

  animate() {
    this.material.uniforms.sunDirection.value.copy(calculateSunPosition(new Date()));
    requestAnimationFrame(() => this.animate());
  }
}

new GlobeApp("globeViz");