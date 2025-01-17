const TableComponent = (sales) => {
    return (
        <table border="1" style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Category Item</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Discount</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.SK}>
                <td>{sale.PK.split("#")[1]}</td>
                <td>{sale.type}</td>
                <td>{sale.gameType}</td>
                <td>{sale.quantity}</td>
                <td>${sale.totalAmount.toFixed(2)}</td>
                <td>{sale.discount}%</td>
                <td>{sale.comment || "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
    )
};

export default TableComponent;