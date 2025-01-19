import React, {useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TableComponent from './Table';
import Loading from "../components/Modal/Loading";

function HistorySales() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true); // State to handle loading
  const [startSearch, setStartSearch] = useState(false);
  const [error, setError] = useState(null); // State to handle errors
  const [totalSales, setTotalSales] = useState(0);

  // Format the date to "YYYY-MM-DD"
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle search button click
  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date.");
      return;
    }
    setStartSearch(true);
    // API call with formatted dates
    const apiUrl = `https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales?fromDate=${formatDate(fromDate)}&toDate=${formatDate(toDate)}`;

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
      if (salesResponse.data != null) {
        let total = 0;
        salesResponse.data.forEach(salesData => {
          total += salesData.totalAmount;
        });
        setTotalSales(total);
      }
    } catch (err) {
      setError(err.message); // Set error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* From Date */}
        <div>
          <label>From: </label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select From Date"
          />
        </div>

        {/* To Date */}
        <div>
          <label>To: </label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select To Date"
          />
        </div>

        {/* Search Button */}
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="history-sales">
        {startSearch && loading && <Loading />}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && sales.length === 0 && <p>No sales from {formatDate(fromDate)} - {formatDate(toDate)}.</p>}
        {!loading && !error && sales.length > 0 && <p>Sales from : ${totalSales.toFixed(2)}</p>}
        {!loading && !error && sales.length > 0 && (
          <TableComponent sales={sales} showActionButton={false} />
        )}
      </div>
    </div>
  );
}

export default HistorySales;
