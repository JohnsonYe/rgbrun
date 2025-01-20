import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import MainContent from "./components/MainContent/MainContent";
import { BrowserRouter as Router } from 'react-router-dom';
import Modal from "./components/Modal/Modal";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [globalTodaySales, setGlobalTodaySales] = useState([]); // State to store sales data
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="RgbRunSalesApp">
      <Router>
        <Navbar onCreateSales={openModal} />
        <MainContent globalTodaySales={globalTodaySales} setGlobalTodaySales={setGlobalTodaySales} />
        {showModal && <Modal onClose={closeModal} globalTodaySales={globalTodaySales} setGlobalTodaySales={setGlobalTodaySales} />}
      </Router>
    </div>
  );
}

export default App;