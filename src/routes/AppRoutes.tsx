import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Ticket from "../pages/Ticket";
import Header from "../components/Header";
import HomePage from "../pages/Home";
import Login from "../pages/Login";
import Gallary from "../pages/gallary";
import Preset from "../pages/Presets";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <>
              <Header />
              <HomePage />
              <Sidebar />
            </>
          }
        />
        <Route
          path="/ticket"
          element={
            <>
              <Header />
              <Ticket />
              <Sidebar />
            </>
          }
        />
        <Route
          path="/gallary"
          element={
            <>
              <Header />
              <Gallary />
              <Sidebar />
            </>
          }
        />
        Preset
        <Route
          path="/preset"
          element={
            <>
              <Header />
              <Preset />
              <Sidebar />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
