import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-106.4850, 31.7619], // El Paso
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => map.remove();
  }, []);

  return (
  <div
    ref={mapContainer}
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      width: "100%",
    }}
  />
);
}
