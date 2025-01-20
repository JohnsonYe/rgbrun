import React, { useState } from "react";
import Loading from "../components/Modal/Loading";
const UPDATE_SALE_API_END_POINT = "https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales";

const TableComponent = ({
    sales, 
    setSales,
    showActionButton,
    editRowId,
    setEditRowId,
    editedRowData,
    setEditedRowData
}) => {
    const [loading, setLoading] = useState(false); // State to handle loading
    const handleEdit = (rowId) => {
        setEditRowId(rowId);
        const rowToEdit = sales.find((sale) => sale.SK === rowId);
        console.log("rowId: ", rowId);
        setEditedRowData({ ...rowToEdit });
        console.log("rowToEdit: ", rowToEdit);
    };

    const handleCancel = () => {
        setEditRowId(null);
        setEditedRowData({});
    };

    const handleDone = async (rowId) => {
        setLoading(true);
        const response = await fetch(UPDATE_SALE_API_END_POINT, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editedRowData)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const salesResponse = await response.json();
        
        setSales((prevData) =>
            prevData.map((sale) =>
              sale.SK === rowId ? salesResponse.updatedSalesData : sale
            )
        );
        setEditRowId(null); // Exit edit mode
        setEditedRowData({});
        setLoading(false);
    };

    const handleInputChange = (e, field) => {
        console.log();
        setEditedRowData((prevData) => ({
        ...prevData,
        [field]: e.target.value,
        }));
    };
    
    return (
        <>
            {loading && <Loading />}
            <table border="1" style={{ width: "100%", textAlign: "left" }}>
            <thead>
                <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Category</th>
                <th>Category Item</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Payment Type</th>
                <th>Discount</th>
                <th>Score</th>
                <th>Comment</th>
                {showActionButton && (<th>Action</th>)}
                </tr>
            </thead>
            <tbody>
                {sales.map((sale) => (
                <tr key={sale.SK}>
                    <td>{sale.PK.split("#")[1]}</td>
                    <td>{convertUnixToTime(sale.SK)}</td>
                    <td>{sale.type}</td>
                    <td>{sale.gameType}</td>
                    <td>{sale.quantity}</td>
                    <td>${sale.totalAmount.toFixed(2)}</td>
                    <td>{sale.paymentType}</td>
                    <td>{sale.discount}%</td>
                    <td>
                        {editRowId === sale.SK ? (<input type="text" value={editedRowData.score || ""} onChange={(e) => handleInputChange(e, "score")}></input>) : (sale.score || "0")}
                    </td>
                    <td>
                        {editRowId === sale.SK ? (<input type="text" value={editedRowData.comment || ""} onChange={(e) => handleInputChange(e, "comment")}></input>) : (sale.comment || "None")}
                    </td>
                    {showActionButton && (
                        <td>
                            {editRowId === sale.SK ? (
                                <>
                                    <button onClick={handleDone.bind(null, sale.SK)}>
                                        Done
                                    </button>
                                    <button onClick={handleCancel}>Cancel</button>
                                </>
                            ): (<button onClick={handleEdit.bind(null, sale.SK)}>Edit</button>)}
                        </td>)
                        }
                </tr>
                ))}
            </tbody>
            </table>
        </>
    )
};

function convertUnixToTime(unixTimestamp) {
    // Convert Unix timestamp to milliseconds
    const date = new Date(unixTimestamp * 1000);
  
    // Extract the hours, minutes, and seconds in GMT
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
  
  

export default TableComponent;