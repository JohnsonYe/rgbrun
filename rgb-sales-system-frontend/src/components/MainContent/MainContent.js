import React from "react";
import TodaySales from "../../pages/TodaySales";
import HistorySales from "../../pages/HistorySales";
import PartySales from "../../pages/PartySales";
import { Routes, Route } from "react-router-dom";

function MainContent({
  globalTodaySales, 
  setGlobalTodaySales
}) {
  return (
    <div className="main-content">
    <Routes>
        <Route path="/" element={<TodaySales globalTodaySales={globalTodaySales} setGlobalTodaySales={setGlobalTodaySales} />} />
        <Route path="/history-sales" element={<HistorySales />} />
        <Route path="/party-sales" element={<PartySales />} />
    </Routes>
    </div>
  );
}

export default MainContent;
