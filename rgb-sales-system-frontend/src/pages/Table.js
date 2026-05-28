import React, { useMemo, useState } from "react";
import Loading from "../components/Modal/Loading";
import "./Table.css";

const UPDATE_SALE_API_END_POINT = "https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales";

const COLUMNS = [
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "type", label: "Category" },
    { key: "gameType", label: "Item" },
    { key: "quantity", label: "Qty" },
    { key: "totalAmount", label: "Amount", align: "right" },
    { key: "paymentType", label: "Payment" },
    { key: "discount", label: "Discount" },
    { key: "score", label: "Score" },
    { key: "comment", label: "Comment" },
];

const categoryBadgeClass = (value) => {
    const v = (value || "").toUpperCase();
    if (v === "GAME") return "badge badge-game";
    if (v === "DRINK") return "badge badge-drink";
    return "badge badge-default";
};

const paymentBadgeClass = (value) => {
    const v = (value || "").toUpperCase();
    if (v === "CARD") return "badge badge-card";
    if (v === "CASH") return "badge badge-cash";
    return "badge badge-default";
};

const itemBadgeClass = (value) => {
    const v = (value || "").toUpperCase();
    if (v === "CHALLENGE") return "badge badge-challenge";
    if (v === "NORMAL") return "badge badge-normal";
    return null;
};

function convertUnixToTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

const getGroupKey = (sale, groupBy) => {
    if (groupBy === "type") return sale.type || "OTHER";
    if (groupBy === "paymentType") return sale.paymentType || "OTHER";
    return null;
};

const SalesTable = ({
    sales,
    setSales,
    showActionButton,
    editRowId,
    setEditRowId,
    editedRowData,
    setEditedRowData,
    sortKey,
    sortDir,
    onSort,
    groupBy,
}) => {
    const [loading, setLoading] = useState(false);

    const handleEdit = (rowId) => {
        setEditRowId(rowId);
        const rowToEdit = sales.find((sale) => sale.SK === rowId);
        setEditedRowData({ ...rowToEdit });
    };

    const handleCancel = () => {
        setEditRowId(null);
        setEditedRowData({});
    };

    const handleDone = async (rowId) => {
        setLoading(true);
        try {
            const response = await fetch(UPDATE_SALE_API_END_POINT, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedRowData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const salesResponse = await response.json();
            setSales((prevData) =>
                prevData.map((sale) =>
                    sale.SK === rowId ? salesResponse.updatedSalesData : sale
                )
            );
            setEditRowId(null);
            setEditedRowData({});
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, field) => {
        setEditedRowData((prevData) => ({
            ...prevData,
            [field]: e.target.value,
        }));
    };

    const grouped = useMemo(() => {
        if (!groupBy || groupBy === "none") return null;
        const map = new Map();
        sales.forEach((sale) => {
            const key = getGroupKey(sale, groupBy);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(sale);
        });
        return Array.from(map.entries()).map(([key, items]) => ({
            key,
            items,
            subtotal: items.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0),
        }));
    }, [sales, groupBy]);

    const renderSortIndicator = (key) => {
        const isSorted = sortKey === key;
        const arrow = isSorted ? (sortDir === "asc" ? "▲" : "▼") : "↕";
        return <span className="sort-indicator">{arrow}</span>;
    };

    const renderRow = (sale) => {
        const itemBadge = itemBadgeClass(sale.gameType);
        return (
            <tr key={sale.SK}>
                <td className="cell-muted">{sale.PK ? sale.PK.split("#")[1] : ""}</td>
                <td className="cell-muted">{convertUnixToTime(sale.SK)}</td>
                <td>
                    <span className={categoryBadgeClass(sale.type)}>{sale.type || "—"}</span>
                </td>
                <td>
                    {itemBadge ? (
                        <span className={itemBadge}>{sale.gameType}</span>
                    ) : (
                        <span className="cell-muted">{sale.gameType || "—"}</span>
                    )}
                </td>
                <td>{sale.quantity}</td>
                <td className="cell-amount" style={{ textAlign: "right" }}>
                    ${Number(sale.totalAmount).toFixed(2)}
                </td>
                <td>
                    <span className={paymentBadgeClass(sale.paymentType)}>{sale.paymentType}</span>
                </td>
                <td className="cell-muted">{sale.discount}%</td>
                <td>
                    {editRowId === sale.SK ? (
                        <input
                            className="row-input"
                            type="text"
                            value={editedRowData.score || "0"}
                            onChange={(e) => handleInputChange(e, "score")}
                        />
                    ) : (
                        sale.score || "0"
                    )}
                </td>
                <td>
                    {editRowId === sale.SK ? (
                        <input
                            className="row-input"
                            type="text"
                            value={editedRowData.comment || ""}
                            onChange={(e) => handleInputChange(e, "comment")}
                        />
                    ) : (
                        <span className="cell-muted">{sale.comment || "—"}</span>
                    )}
                </td>
                {showActionButton && (
                    <td>
                        <div className="row-actions">
                            {editRowId === sale.SK ? (
                                <>
                                    <button className="btn-row primary" onClick={() => handleDone(sale.SK)}>
                                        Save
                                    </button>
                                    <button className="btn-row" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button className="btn-row" onClick={() => handleEdit(sale.SK)}>
                                    Edit
                                </button>
                            )}
                        </div>
                    </td>
                )}
            </tr>
        );
    };

    const totalColumns = COLUMNS.length + (showActionButton ? 1 : 0);

    return (
        <>
            {loading && <Loading />}
            <div className="sales-table-wrapper">
                <div className="sales-table-scroll">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                {COLUMNS.map((col) => {
                                    const isSorted = sortKey === col.key;
                                    const className = `sortable ${isSorted ? "sorted" : ""}`;
                                    return (
                                        <th
                                            key={col.key}
                                            className={className}
                                            onClick={() => onSort && onSort(col.key)}
                                            style={col.align === "right" ? { textAlign: "right" } : undefined}
                                        >
                                            {col.label}
                                            {onSort && renderSortIndicator(col.key)}
                                        </th>
                                    );
                                })}
                                {showActionButton && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {grouped
                                ? grouped.map((group) => (
                                      <React.Fragment key={group.key}>
                                          <tr className="group-row">
                                              <td colSpan={totalColumns}>
                                                  {group.key} · {group.items.length} item
                                                  {group.items.length === 1 ? "" : "s"}
                                                  <span className="group-subtotal">
                                                      Subtotal ${group.subtotal.toFixed(2)}
                                                  </span>
                                              </td>
                                          </tr>
                                          {group.items.map(renderRow)}
                                      </React.Fragment>
                                  ))
                                : sales.map(renderRow)}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default SalesTable;
