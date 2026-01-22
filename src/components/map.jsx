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
        map.on("load", async () => {
            // Add zoning source
            map.addSource("zoning", {
                type: "geojson",
                data: "/data/zoning.geojson",
            });

            // Add zoning layer
            map.addLayer({
                id: "zoning-fill",
                type: "fill",
                source: "zoning",
                paint: {
                    "fill-color": [
                        "match",
                        ["get", "ZONELABEL"],
                        "C1", "#4CAF50",
                        "C2", "#2E7D32",
                        "C3", "#1B5E20",
                        "#CCCCCC" // default
                    ],
                    "fill-opacity": 0.5,
                },
            });

            // Optional outline
            map.addLayer({
                id: "zoning-outline",
                type: "line",
                source: "zoning",
                paint: {
                    "line-color": "#555",
                    "line-width": 0.5,
                },
            });
        });
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
