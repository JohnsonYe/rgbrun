import React, { useEffect, useState } from "react";
import TableComponent from './Table';
import "./TodaySales.css";
import Loading from "../components/Modal/Loading";

const TodaySales = () => {
  const [sales, setSales] = useState([]); // State to store sales data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors
  const [totalSales, setTotalSales] = useState(0);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchSales = async () => {
      const today = getTodayDate(); // Get today's date
      
      const apiUrl = `https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales?fromDate=${today}&toDate=${today}`;

      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const salesResponse = await response.json();
        setSales(salesResponse.data); // Set sales data
        let total = 0;
        if (salesResponse.data != null) {
          salesResponse.data.forEach(data => {
            total += data.totalAmount;
            setTotalSales(total);
          })
        }
      } catch (err) {
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchSales();
  }, []); // Run once when the component mounts

  return (
    <div className="today-sales">
      {loading && <Loading />}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && sales.length === 0 && <p>No sales for today.</p>}
      <p>Today total sales: ${totalSales}</p>
      {!loading && !error && sales.length > 0 && (
        TableComponent(sales)
      )}
    </div>
  );
};

export default TodaySales;