export default function Sidebar() {
  return (
    <aside className="sidebar">
      <section>
        <h2>How to Read This Map</h2>
        <ul>
          <li>Darker areas = higher population density</li>
          <li>Dots show potential store sites</li>
          <li>Red favors H-E-B, yellow favors Trader Joe’s</li>
        </ul>
      </section>

      <section>
        <h2>Legend</h2>
        <div className="legend-item">
          <span className="legend-color heb" /> H-E-B favored
        </div>
        <div className="legend-item">
          <span className="legend-color tj" /> Trader Joe’s favored
        </div>
      </section>

      <section className="note">
        <p>
          Scores are relative and based on land size and surrounding population
          density — not an official recommendation.
        </p>
      </section>
    </aside>
  );
}
