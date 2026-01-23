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
            map.addLayer({
                id: "zoning-outline",
                type: "line",
                source: "zoning",
                paint: {
                    "line-color": "#1B5E20",
                    "line-width": 1
                }
            });
            // Add zoning layer
            map.addLayer({
                id: "zoning-commercial",
                type: "fill",
                source: "zoning",
                paint: {
                    "fill-color": [
                        "case",
                        ["==", ["slice", ["get", "ZONE_"], 0, 1], "C"],
                        "#2E7D32",
                        "rgba(0,0,0,0)"
                    ],
                    "fill-opacity": 0.45
                }
            });
            map.on("click", "zoning-commercial", (e) => {
                const props = e.features[0].properties;

                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                    <strong>Zone:</strong> ${props.ZONE_}<br/>
                    <strong>Label:</strong> ${props.LABEL || "N/A"}<br/>
                    <strong>Area:</strong> ${(props.Shape_Area * 404686).toFixed(2)} acres
                `)
                    .addTo(map);
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
