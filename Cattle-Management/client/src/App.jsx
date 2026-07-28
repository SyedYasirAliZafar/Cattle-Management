import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import AddAnimal from "./pages/AddAnimal.jsx";
import AnimalProfile from "./pages/AnimalProfile.jsx";
import BulkVaccinate from "./pages/BulkVaccinate.jsx";
import BulkWeighIn from "./pages/BulkWeighIn.jsx";
import ClientSearch from "./pages/ClientSearch.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add" element={<AddAnimal />} />
      <Route path="/animals/:animalId" element={<AnimalProfile />} />
      <Route path="/vaccinate" element={<BulkVaccinate />} />
      <Route path="/weigh-in" element={<BulkWeighIn />} />
      <Route path="/client-search" element={<ClientSearch initialMode="animal" />} />
      <Route path="/contact-search" element={<ClientSearch initialMode="contact" />} />
    </Routes>
  );
}
