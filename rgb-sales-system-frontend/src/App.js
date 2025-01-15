import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import MainContent from "./components/MainContent/MainContent";
import { BrowserRouter as Router } from 'react-router-dom';
import Modal from "./components/Modal/Modal";

function App() {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="RgbRunSalesApp">
      <Router>
        <Navbar onCreateSales={openModal} />
        <MainContent />
        {showModal && <Modal onClose={closeModal} />}
      </Router>
    </div>
  );
}

export default App;