import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import MainContent from "./components/MainContent/MainContent";
import { BrowserRouter as Router } from 'react-router-dom';
import Modal from "./components/Modal/Modal";
import PartyModal from "./components/Modal/PartyModal";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [globalTodaySales, setGlobalTodaySales] = useState([]); // State to store sales data
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const openPartyModal = () => setShowPartyModal(true);
  const closePartyModal = () => setShowPartyModal(false);

  return (
    <div className="RgbRunSalesApp">
      <Router>
        <Navbar onCreateSales={openModal} onCreateParty={openPartyModal} />
        <MainContent globalTodaySales={globalTodaySales} setGlobalTodaySales={setGlobalTodaySales} />
        {showModal && <Modal onClose={closeModal} globalTodaySales={globalTodaySales} setGlobalTodaySales={setGlobalTodaySales} />}
        {showPartyModal && <PartyModal onClose={closePartyModal} globalTodaySales={globalTodaySales} setGlobalTodaySales={setGlobalTodaySales} />}
      </Router>
    </div>
  );
}

export default App;