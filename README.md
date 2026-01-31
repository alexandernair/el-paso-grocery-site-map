# 🗺️ Grocery Store Site Analysis — El Paso

This project explores **where Trader Joe’s or H-E-B could plausibly build a new store in El Paso, TX**, using zoning data, population density, and spatial analysis.

The goal is not to predict corporate decisions, but to demonstrate how **geospatial data can support real-world site selection problems**.

🔗 **Live Demo:** _(add link once deployed)_

---

## 📌 What This Project Does

- Identifies **commercially zoned parcels** in El Paso
- Calculates **population density** using U.S. Census data
- Scores each site based on:
  - Land size
  - Surrounding population density
- Visually compares **Trader Joe’s vs H-E-B suitability**
- Presents results in an **interactive web map**

---

## 🧠 Why Trader Joe’s vs H-E-B?

El Paso needs a Trader Joe's or H-E-B. I can't live off Food King, Albertsons and Walmart. 

Here is how I compared them:

| Trader Joe’s | H-E-B |
|-------------|------|
| Smaller footprint | Large footprint |
| Dense, urban areas | Regional catchments |
| High visit frequency | Destination shopping |
| Short travel distance | Willingness to drive |

This makes them an ideal comparison for demonstrating **tradeoffs between land size and population density**.

---

## 🗺️ How to Read the Map

- **Shaded areas** represent population density  
  (darker = more people per square mile)
- **Dots** represent potential commercial sites
- **Yellow dots** favor Trader Joe’s
- **Red dots** favor H-E-B
- Larger, darker dots indicate **higher confidence**

Click a site to see:
- Estimated suitability scores
- Relative advantage
- Approximate land size

---

## 🧱 Data Sources

- **Zoning data:** City of El Paso GIS
- **Population data:**  
  U.S. Census Bureau — ACS 5-Year Estimates (B01003)
- **Geographic boundaries:**  
  TIGER/Line Census Tracts

All data is processed locally and served as static GeoJSON files.

---

## 🛠️ Tech Stack

**Frontend**
- React
- MapLibre GL JS
- Vanilla CSS

**Geospatial Processing**
- QGIS
- GeoJSON
- U.S. Census ACS & TIGER datasets

**Hosting**
- Static site (Vercel / GitHub Pages ready)

---

## 🧮 Scoring Methodology (High-Level)

Each site receives two scores (0–100):

- **Trader Joe’s score**
  - Optimized for medium-sized parcels
  - Heavily influenced by population density

- **H-E-B score**
  - Rewards larger parcels
  - Less sensitive to density due to broader catchment areas

Scores are **relative**, not absolute, and are intended for comparison *within El Paso only*.

---

## ⚠️ Limitations & Assumptions

- Does not account for:
  - Traffic patterns
  - Income or demographic preferences
  - Competition or land cost
- Population density is measured at the census tract level
- Zoning data may include parcels that are impractical to develop

This project is exploratory and educational, not predictive.

---

## 🚀 Future Improvements

- Distance-weighted population modeling
- Income and age demographic overlays
- Drive-time isochrones
- Mobile responsiveness
- Scenario toggles (TJ-only / H-E-B-only views)

---

## 👋 About

Built by **Alex Nair** as a portfolio project combining:
- Software engineering
- GIS analysis
- Product thinking

If you’re interested in geospatial analysis, urban planning, or data-driven decision tools, feel free to reach out.
