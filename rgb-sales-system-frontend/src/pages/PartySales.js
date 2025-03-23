import React, { useState } from "react";
import Loading from "../components/Modal/Loading";

const BASE_API = "https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/party";
const DEPOSIT_AMOUNT = 100;
function PartySales() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [parties, setParties] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [tempEdits, setTempEdits] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!fromDate) return alert("Please select a from date");
    const query = new URLSearchParams({
      fromDate,
      ...(toDate && { toDate }),
    });

    try {
      setIsSubmitting(true);
      const apiUrl = `${BASE_API}?fromDate=${fromDate}&toDate=${toDate}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      const enriched = data.data.map((party, index) => ({
        ...party,
        id: party.id || index,
        paidDeposit: party.paidDeposit || false,
        paidCompleted: party.paidCompleted || false,
        remainingAmount: party.amount,
      }));

      setParties(enriched);
    } catch (error) {
      console.error("Error fetching parties:", error);
      alert("Failed to fetch parties");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    setEditRow(id);
    const party = parties.find((p) => p.id === id);
    setTempEdits({
        PK: party.PK,
        SK: party.SK,
        paidDeposit: party.paidDeposit,
        paidCompleted: party.paidCompleted,
        comment: party.comment || "",
    });
  };

  const handleCancel = () => {
    setEditRow(null);
    setTempEdits({});
  };

  const handleDone = async (id) => {
    const updated = parties.map((party) =>
      party.id === id ? { ...party, ...tempEdits } : party
    );
    setParties(updated);
    setEditRow(null);
    setIsSubmitting(true);
  
    try {
      await fetch(BASE_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempEdits),
      });
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update party, call Johnson: 9253302206");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
        {isSubmitting && <Loading />}
        <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
            <label style={{ marginRight: "10px" }}>
            From:
            <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ marginLeft: "5px" }}
            />
            </label>

            <label style={{ marginRight: "10px" }}>
            To:
            <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ marginLeft: "5px" }}
            />
            </label>

            <button onClick={handleSearch}>Search</button>
        </div>

        {parties.length > 0 && (
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
            <thead>
                <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Comment</th>
                <th>Total Amount</th>
                <th>Remaining Amount</th>
                <th>Paid Deposit</th>
                <th>Paid Completed</th>
                <th>Update</th>
                </tr>
            </thead>
            <tbody>
                {parties.map((party) => (
                <tr key={party.id}>
                    <td>{party.eventDate}</td>
                    <td>{party.eventTime}</td>
                    <td>{party.customerName}</td>
                    <td>{party.packageOption.name}</td>
                    <td>{party.emailAddress}</td>
                    <td>{party.phoneNumber}</td>
                    <td>
                        {editRow === party.id ? (
                            <input
                            type="text"
                            value={tempEdits.comment}
                            onChange={(e) =>
                                setTempEdits((prev) => ({
                                    ...prev,
                                    comment: e.target.value,
                                }))
                            }
                            style={{ width: "100%" }}
                            />
                        ) : (
                            party.comment
                        )}
                    </td>
                    <td>${party.amount}</td>
                    <td>
                        ${party.paidDeposit
                            ? party.paidCompleted
                                ? party.amount - party.remainingAmount
                                : party.amount - DEPOSIT_AMOUNT 
                            : party.amount}
                    </td>
                    <td>
                    {editRow === party.id ? (
                        <input
                            type="checkbox"
                            checked={tempEdits.paidDeposit}
                            onChange={(e) =>
                                setTempEdits((prev) => ({
                                    ...prev,
                                    paidDeposit: e.target.checked,
                                }))
                            }
                        />
                    ) : party.paidDeposit ? (
                        "✓"
                    ) : (
                        ""
                    )}
                    </td>
                    <td>
                    {editRow === party.id ? (
                        <input
                            type="checkbox"
                            checked={tempEdits.paidComleted}
                            onChange={(e) =>
                                setTempEdits((prev) => ({
                                    ...prev,
                                    paidCompleted: e.target.checked,
                                }))
                            }
                        />
                    ) : party.paidCompleted ? (
                        "✓"
                    ) : (
                        ""
                    )}
                    </td>
                    <td>
                    {editRow === party.id ? (
                        <>
                        <button onClick={handleCancel}>Cancel</button>{" "}
                        <button onClick={() => handleDone(party.id)}>Done</button>
                        </>
                    ) : (
                        <button onClick={() => handleEdit(party.id)}>Update</button>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </div>
    </>
  );
};

export default PartySales;
