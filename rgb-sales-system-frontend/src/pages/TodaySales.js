import React, { useEffect, useMemo, useState } from "react";
import SalesTable from "./Table";
import Loading from "../components/Modal/Loading";
import "./TodaySales.css";
import "./SalesShared.css";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
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

const TodaySales = ({ globalTodaySales, setGlobalTodaySales }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [cashSales, setCashSales] = useState(0);
  const [cardSales, setCardSales] = useState(0);

  const [editRowId, setEditRowId] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  const [sortKey, setSortKey] = useState("time");
  const [sortDir, setSortDir] = useState("desc");
  const [groupBy, setGroupBy] = useState("none");

  useEffect(() => {
    const fetchSales = async () => {
      const today = getTodayDate();
      const apiUrl = `https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales?fromDate=${today}&toDate=${today}`;
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const salesResponse = await response.json();
        setGlobalTodaySales(salesResponse.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let total = 0;
    let cash = 0;
    let card = 0;
    (globalTodaySales || []).forEach((data) => {
      total += Number(data.totalAmount) || 0;
      if (data.paymentType === "CASH") cash += Number(data.totalAmount) || 0;
      else if (data.paymentType === "CARD") card += Number(data.totalAmount) || 0;
    });
    setTotalSales(total);
    setCashSales(cash);
    setCardSales(card);
  }, [globalTodaySales]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedSales = useMemo(() => {
    const list = [...(globalTodaySales || [])];
    list.sort((a, b) => {
      const va = getSortableValue(a, sortKey);
      const vb = getSortableValue(b, sortKey);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [globalTodaySales, sortKey, sortDir]);

  const hasSales = !loading && !error && sortedSales.length > 0;

  return (
    <div className="today-sales">
      {loading && <Loading />}

      <div className="page-header">
        <div>
          <h1 className="title">Today's Sales</h1>
          <p className="subtitle">{getTodayDate()}</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-primary">
          <div className="kpi-label">
            <span className="kpi-icon">$</span>
            Total Revenue
          </div>
          <div className="kpi-value">${totalSales.toFixed(2)}</div>
          <div className="kpi-sub">{(globalTodaySales || []).length} transactions</div>
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

      {error && <div className="error-banner">Error: {error}</div>}

      {hasSales && (
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
      )}

      {!loading && !error && sortedSales.length === 0 && (
        <div className="empty-state">
          <h3>No sales yet today</h3>
          <p>Click "Sale" in the top right to record one.</p>
        </div>
      )}

      {hasSales && (
        <SalesTable
          sales={sortedSales}
          setSales={setGlobalTodaySales}
          showActionButton={true}
          editRowId={editRowId}
          setEditRowId={setEditRowId}
          editedRowData={editedRowData}
          setEditedRowData={setEditedRowData}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          groupBy={groupBy}
        />
      )}
    </div>
  );
};

export default TodaySales;
