import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
            center: [-106.4850, 31.7619],
            zoom: 11,
        });
        function scoreSite(area, density = 0) {
            if (!area || area <= 0) return { tj: 0, heb: 0 };

            const tjIdeal = 0.000003;
            const tjTolerance = 0.000002;
            const hebMax = 0.000006;

            const tjSize = Math.exp(
                -Math.pow(area - tjIdeal, 2) / (2 * Math.pow(tjTolerance, 2))
            );

            const hebSize = Math.min(area / hebMax, 1);

            const tjDensity = Math.min(density / 6000, 1);
            const hebDensity = Math.min(density / 12000, 1);

            return {
                tj: Math.round((tjSize * 0.6 + tjDensity * 0.4) * 100),
                heb: Math.round((Math.pow(hebSize, 1.4) * 0.7 + hebDensity * 0.3) * 100)
            };
        }

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        map.on("load", async () => {
            // --- Zoning outline layer first ---
            map.addSource("zoning", {
                type: "geojson",
                data: "/data/zoning.geojson",
            });
            map.addSource("population", {
                type: "geojson",
                data: "/data/el_paso_tracts_with_density.geojson"
            });
            map.addLayer({
                id: "population-density",
                type: "fill",
                source: "population",
                paint: {
                    "fill-color": [
                        "interpolate",
                        ["linear"],
                        ["get", "pop_density"],
                        500, "#FFFDE7",
                        2000, "#FFF59D",
                        5000, "#FBC02D",
                        10000, "#F57F17"
                    ],
                    "fill-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        10, 0.15,
                        13, 0.45
                    ]
                }
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

            // --- Fetch, score, and add points ---
            const res = await fetch("/data/zoning_with_density.geojson");
            const data = await res.json();

            const features = data.features.filter(f =>
                f.properties.ZONE_?.startsWith("C") &&
                f.properties.Shape_Area > 0.000001
            );

            const siteFeatures = features.map(f => {
                const coords = f.geometry.coordinates.flat(2);
                let x = 0, y = 0;
                coords.forEach(c => { x += c[0]; y += c[1]; });
                const centroid = [x / coords.length, y / coords.length];
                const density = Number(f.properties.pop_density) || 0;
                const scores = scoreSite(
                    f.properties.Shape_Area,
                    density
                );
                const margin = Math.abs(scores.heb - scores.tj);

                return {
                    type: "Feature",
                    properties: {
                        zone: f.properties.ZONE_,
                        area: f.properties.Shape_Area,
                        tj_score: scores.tj,
                        heb_score: scores.heb,
                        winner: scores.heb > scores.tj ? "heb" : "tj",
                        margin: margin
                    },
                    geometry: {
                        type: "Point",
                        coordinates: centroid
                    }
                };
            });

            map.addSource("ranked-sites", {
                type: "geojson",
                data: { type: "FeatureCollection", features: siteFeatures }
            });

            map.addLayer({
                id: "ranked-sites-layer",
                type: "circle",
                source: "ranked-sites",
                paint: {
                    "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["get", "margin"],
                        0, 4,
                        10, 8
                    ],
                    "circle-color": [
                        "match",
                        ["get", "winner"],
                        "heb", "#C62828",
                        "tj", "#F9A825",
                        "#999999"
                    ],
                    "circle-opacity": [
                        "interpolate",
                        ["linear"],
                        ["get", "margin"],
                        0, 0.3,
                        50, 0.85
                    ],
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#333"
                }
            });

            map.on("click", "ranked-sites-layer", (e) => {
                const p = e.features[0].properties;
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                    <strong>Commercial Zone:</strong> ${p.zone}<br/>
                    <strong>Trader Joe’s Score:</strong> ${p.tj_score}<br/>
                    <strong>H-E-B Score:</strong> ${p.heb_score}<br/>
                    <strong>Relative Size:</strong> ${(p.area * 404686).toFixed(1)} acres
                    <strong>Recommendation:</strong>
                    ${p.winner === "heb" ? "H-E-B" : "Trader Joe’s"}
                    (${p.margin} point advantage)
                `)
                    .addTo(map);
            });
            map.on("click", "population-density", (e) => {
                console.log(e.features[0].properties.pop_density);
            });

        });

        return () => map.remove();
    }, []);


    return (
        <>
            <div
                ref={mapContainer}
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "100%",
                }}
            />

            <div style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                background: "white",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
            }}>
            </div>
        </>
    );
}
