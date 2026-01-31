import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import Map from "../components/map";
import "../styles/layout.css";

export default function AppLayout() {
  return (
    <div className="app-root">
      <Header />

      <div className="main-content">
        <Sidebar />
        <div className="map-wrapper">
          <Map />
        </div>
      </div>

      <Footer />
    </div>
  );
}
