import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SalesTable from "./Table";
import Loading from "../components/Modal/Loading";
import "./SalesShared.css";

const formatDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getSortableValue = (sale, key) => {
  switch (key) {
    case "date":
      return sale.PK ? sale.PK.split("#")[1] : "";
    case "time":
      return Number(sale.SK) || 0;
    case "type":
      return (sale.type || "").toUpperCase();
    case "gameType":
      return (sale.gameType || "").toUpperCase();
    case "paymentType":
      return (sale.paymentType || "").toUpperCase();
    case "quantity":
    case "totalAmount":
    case "discount":
      return Number(sale[key]) || 0;
    case "score":
      return Number(sale.score) || 0;
    case "comment":
      return (sale.comment || "").toLowerCase();
    default:
      return sale[key];
  }
};

function HistorySales() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [cashSales, setCashSales] = useState(0);
  const [cardSales, setCardSales] = useState(0);

  const [sortKey, setSortKey] = useState("time");
  const [sortDir, setSortDir] = useState("desc");
  const [groupBy, setGroupBy] = useState("none");

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date.");
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setError(null);
    const apiUrl = `https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales?fromDate=${formatDate(fromDate)}&toDate=${formatDate(toDate)}`;
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const salesResponse = await response.json();
      const data = salesResponse.data || [];
      setSales(data);
      let total = 0;
      let cash = 0;
      let card = 0;
      data.forEach((s) => {
        total += Number(s.totalAmount) || 0;
        if (s.paymentType === "CASH") cash += Number(s.totalAmount) || 0;
        else if (s.paymentType === "CARD") card += Number(s.totalAmount) || 0;
      });
      setTotalSales(total);
      setCashSales(cash);
      setCardSales(card);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedSales = useMemo(() => {
    const list = [...sales];
    list.sort((a, b) => {
      const va = getSortableValue(a, sortKey);
      const vb = getSortableValue(b, sortKey);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [sales, sortKey, sortDir]);

  const hasResults = hasSearched && !loading && !error && sortedSales.length > 0;

  return (
    <div>
      {loading && <Loading />}

      <div className="page-header">
        <div>
          <h1 className="title">Sales History</h1>
          <p className="subtitle">Search past sales by date range.</p>
        </div>
      </div>

      <div className="filter-card">
        <div className="field">
          <label>From</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
          />
        </div>
        <div className="field">
          <label>To</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
          />
        </div>
        <button className="btn-action" onClick={handleSearch}>
          Search
        </button>
      </div>

      {error && <div className="error-banner">Error: {error}</div>}

      {hasResults && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card kpi-primary">
              <div className="kpi-label">
                <span className="kpi-icon">$</span>
                Total Revenue
              </div>
              <div className="kpi-value">${totalSales.toFixed(2)}</div>
              <div className="kpi-sub">
                {formatDate(fromDate)} — {formatDate(toDate)} · {sales.length} transactions
              </div>
            </div>
            <div className="kpi-card kpi-success">
              <div className="kpi-label">
                <span className="kpi-icon">C</span>
                Card
              </div>
              <div className="kpi-value">${cardSales.toFixed(2)}</div>
              <div className="kpi-sub">
                {totalSales ? `${((cardSales / totalSales) * 100).toFixed(0)}% of revenue` : "—"}
              </div>
            </div>
            <div className="kpi-card kpi-warn">
              <div className="kpi-label">
                <span className="kpi-icon">$</span>
                Cash
              </div>
              <div className="kpi-value">${cashSales.toFixed(2)}</div>
              <div className="kpi-sub">
                {totalSales ? `${((cashSales / totalSales) * 100).toFixed(0)}% of revenue` : "—"}
              </div>
            </div>
          </div>

          <div className="toolbar">
            <div className="toolbar-left">
              <span className="label">Group by</span>
              <div className="segmented">
                <button
                  className={groupBy === "none" ? "active" : ""}
                  onClick={() => setGroupBy("none")}
                >
                  None
                </button>
                <button
                  className={groupBy === "type" ? "active" : ""}
                  onClick={() => setGroupBy("type")}
                >
                  Category
                </button>
                <button
                  className={groupBy === "paymentType" ? "active" : ""}
                  onClick={() => setGroupBy("paymentType")}
                >
                  Payment
                </button>
              </div>
            </div>
            <div className="toolbar-right">
              <span className="label">Sort</span>
              <select
                className="select-input"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="time">Time</option>
                <option value="date">Date</option>
                <option value="type">Category</option>
                <option value="gameType">Item</option>
                <option value="totalAmount">Amount</option>
                <option value="paymentType">Payment</option>
                <option value="quantity">Quantity</option>
              </select>
              <button
                className="btn-row"
                onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                title="Toggle direction"
              >
                {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
          </div>

          <SalesTable
            sales={sortedSales}
            showActionButton={false}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            groupBy={groupBy}
          />
        </>
      )}

      {hasSearched && !loading && !error && sales.length === 0 && (
        <div className="empty-state">
          <h3>No sales in this range</h3>
          <p>
            Nothing between {formatDate(fromDate)} and {formatDate(toDate)}.
          </p>
        </div>
      )}

      {!hasSearched && (
        <div className="empty-state">
          <h3>Pick a date range</h3>
          <p>Select From and To dates and click Search.</p>
        </div>
      )}
    </div>
  );
}

export default HistorySales;
