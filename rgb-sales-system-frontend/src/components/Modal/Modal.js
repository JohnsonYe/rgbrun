import React, { useState } from "react";
import {GAME_PRICE, GAME_TYPE, CHALLENGE_GAME_PRICE, SALES_TYPE} from "../../constants/GameConstant";
import DFRINK_ITEM_LIST from "../../constants/DrinkConstant";
import Loading from "./Loading";
import "./Modal.css";

const SALES_CREATION_API = "https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales";

function Modal({ onClose }) {
    const [activeForm, setActiveForm] = useState("Sales");

    const handleFormSwitch = (form) => {
        setActiveForm(form);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {/* Form Switch Buttons */}
            <div className="form-switch">
              <button
                className={`form-switch-btn ${activeForm === "Sales" ? "active" : ""}`}
                onClick={() => handleFormSwitch("Sales")}
              >
                Games
              </button>
              <button
                className={`form-switch-btn ${activeForm === "Drinks" ? "active" : ""}`}
                onClick={() => handleFormSwitch("Drinks")}
              >
                Drinks
              </button>
            </div>
    
            {/* Render Active Form */}
            {activeForm === "Sales" ? <SalesForm /> : <DrinksForm />}
    
            <button type="button" className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      );
}

function SalesForm() {
    const [quantity, setQuantity] = useState(2); // Default quantity
    const [kidQuantity, setKidQuantity] = useState(0); // Default kids quantity
    const [discount, setDiscount] = useState(0); // Default discount ratio
    const [totalAmount, setTotalAmount] = useState(quantity * GAME_PRICE[quantity]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comment, setComment] = useState(""); // Comment field
    const [paymentType, setPaymentType] = useState('CARD'); // Default to CARD
    const [gameType, setGameType] = useState(GAME_TYPE.NORMAL);
    

    // Calculate total amount whenever quantity or discount changes
    const calculateTotal = (adultQty, kidQty, disc, gameType = GAME_TYPE.NORMAL) => {
        let pricePerPerson = 0;
        const totalQty = adultQty + kidQty;

        if (gameType == GAME_TYPE.CHALLENGE) {
          pricePerPerson = CHALLENGE_GAME_PRICE;
        } else {
          if (totalQty < 2) {
            pricePerPerson = GAME_PRICE[2];
          } else if (totalQty > 10) {
            pricePerPerson = GAME_PRICE[10];
          } else {
            pricePerPerson = GAME_PRICE[totalQty];
          }
        }

        const baseAmount = adultQty * pricePerPerson;
        const baseKidAmount = kidQty * pricePerPerson * 0.5;
        const discountedAmount = baseAmount - baseAmount * (disc / 100) + baseKidAmount;
        const roundedAmount = Math.ceil(discountedAmount * 100) / 100; // Round up to 2 decimals
        setTotalAmount(roundedAmount);
    };

    // Handle quantity change
    const handleQuantityChange = (e) => {
        const qty = Math.max(parseInt(e.target.value, 10), 0);
        setQuantity(qty);
        calculateTotal(qty, kidQuantity, discount);
    };

    const handleKidQuantityChange = (e) => {
        const qty = Math.max(parseInt(e.target.value, 10), 0);
        setKidQuantity(qty);
        calculateTotal(quantity, qty, discount);
    }

    // Handle discount change
    const handleDiscountChange = (e) => {
        const disc = Math.max(0, parseFloat(e.target.value) || 0); // Minimum discount is 0%
        setDiscount(disc);
        calculateTotal(quantity, kidQuantity, disc);
    };

    const handlePaymentTypeToggle = (method) => {
      setPaymentType(method);
      calculateTotal(quantity, kidQuantity, discount);
    };

    const handleGameTypeToggle = (type) => {
      setGameType(type);
      calculateTotal(quantity, kidQuantity, discount, type);
    }
      
    const handleSaleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh
        setIsSubmitting(true);
        
        const salesData = {
            quantity: quantity + kidQuantity,
            totalAmount,
            discount,
            comment,
            paymentType,
            "salesType": SALES_TYPE.GAME,
            gameType
        }
        
        try {
          const response = await fetch(SALES_CREATION_API, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(salesData)
          });
    
          if (response.ok) {
            const result = await response.json();
            console.log("API Response:", result);
          } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
            console.error("API Error:", error);
          }
          // Reset form after successful submission
          setQuantity(2);
          setKidQuantity(0)
          setDiscount(0);
          setComment("");
          setGameType(GAME_TYPE.NORMAL);
        } catch (err) {
          console.error("Network Error:", err);
          alert("Network error. Please try again or call 925-330-2206 for technical support");
        } finally {
          setIsSubmitting(false);
          window.location.reload();
        }
    }

    return (
        <>
            {isSubmitting && <Loading />}
            <form onSubmit={handleSaleSubmit}>

            {/* Toggle Button for Payment Method */}
            <div className="form-group">
              <label>Game Type:</label>
              <div className="toggle-button">
                <button
                  type="button"
                  className={`toggle-option ${gameType === GAME_TYPE.NORMAL ? 'active' : ''}`}
                  onClick={() => handleGameTypeToggle(GAME_TYPE.NORMAL)}
                >
                  Normal
                </button>
                <button
                  type="button"
                  className={`toggle-option ${gameType === GAME_TYPE.CHALLENGE ? 'active' : ''}`}
                  onClick={() => handleGameTypeToggle(GAME_TYPE.CHALLENGE)}
                >
                  Challenge
                </button>
              </div>
            </div>


            <div className="form-group">
                <label>Adult Quantity:</label>
                <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Enter quantity"
                />
            </div>

            <div className="form-group">
                <label>Under 4ft Quantity:</label>
                <input
                type="number"
                value={kidQuantity}
                onChange={handleKidQuantityChange}
                placeholder="Enter quantity"
                />
            </div>

            <div className="form-group">
                <label>Discount (%):</label>
                <input
                type="number"
                value={discount}
                onChange={handleDiscountChange}
                placeholder="Enter discount"
                />
            </div>
            <div className="form-group">
                <label>Total Amount ($):</label>
                <input type="number" value={totalAmount} readOnly />
            </div>


            {/* Toggle Button for Payment Method */}
            <div className="form-group">
              <label>Payment Type:</label>
              <div className="toggle-button">
                <button
                  type="button"
                  className={`toggle-option ${paymentType === 'CARD' ? 'active' : ''}`}
                  onClick={() => handlePaymentTypeToggle('CARD')}
                >
                  CARD
                </button>
                <button
                  type="button"
                  className={`toggle-option ${paymentType === 'CASH' ? 'active' : ''}`}
                  onClick={() => handlePaymentTypeToggle('CASH')}
                >
                  CASH
                </button>
              </div>
            </div>

            <div className="form-group">
                <label>Comment:</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter comment"> </textarea>
            </div>
            <button type="submit" className="submit-btn">
                Submit
            </button>
            </form>
        </>
      );
}

function DrinksForm() {
    const [rows, setRows] = useState([{ drink: "", quantity: 1, price: 0 }]); // Default with one row
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentType, setPaymentType] = useState('CARD'); // Default to CARD
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    // Handle dropdown selection
    const handleDrinkChange = (index, value) => {
      const updatedRows = [...rows];
      const selectedDrink = DFRINK_ITEM_LIST.find((item) => item.name === value);
      updatedRows[index].drink = value;
      updatedRows[index].price = selectedDrink ? selectedDrink.price : 0; // Set price based on selection
      setRows(updatedRows);
      calculateTotal(updatedRows);
    };

    const handlePaymentTypeToggle = (method) => {
      setPaymentType(method);
    };
  
    // Handle quantity change
    const handleQuantityChange = (index, value) => {
      const qty = Math.max(1, parseInt(value, 10) || 1); // Minimum quantity is 1
      const updatedRows = [...rows];
      updatedRows[index].quantity = qty;
      setRows(updatedRows);
      calculateTotal(updatedRows);
    };
  
    // Add a new row
    const addRow = () => {
      setRows([...rows, { drink: "", quantity: 1, price: 0 }]);
    };
  
    // Remove a row
    const removeRow = (index) => {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
      calculateTotal(updatedRows);
    };
  
    // Calculate total amount
    const calculateTotal = (rows) => {
      const total = rows.reduce((sum, row) => sum + row.quantity * row.price, 0);
      setTotalAmount(Math.ceil(total * 100) / 100); // Round up to 2 decimals
    };

    const handleSaleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh
        let quantity = 0;
        let amount = 0;
        let comments = [];
        rows.forEach(row => {
          quantity += row.quantity;
          let totleItemsPrice = row.quantity * row.price;
          amount += totleItemsPrice;
          comments.push(row.drink + ": " + quantity);
        });
        
        if (amount <= 0) {
          alert("Please select a drink before submit.");
          return;
        }

        const salesData = {
          quantity: quantity,
          totalAmount: amount,
          discount: 0,
          comment: comments.join(", "),
          paymentType,
          "salesType": SALES_TYPE.DRINK,
          gameType: ""
        };
        setIsSubmitting(true);
  
        try {
          const response = await fetch(SALES_CREATION_API, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(salesData)
          });
    
          if (response.ok) {
            const result = await response.json();
            console.log("API Response:", result);
          } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
            console.error("API Error:", error);
          }
        } catch (err) {
          console.error("Network Error:", err);
          alert("Network error. Please try again or call 925-330-2206 for technical support");
        } finally {
          setIsSubmitting(false);
          window.location.reload();
        }
    }
  
    return (
      <form onSubmit={handleSaleSubmit}>
        {/* Drink Rows */}
        {rows.map((row, index) => (
          <div key={index} className="drink-row">
            <select
              value={row.drink}
              onChange={(e) => handleDrinkChange(index, e.target.value)}
            >
              <option value="">Select a drink</option>
              {DFRINK_ITEM_LIST.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={row.quantity}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              placeholder="Quantity"
            />
            {rows.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeRow(index)}
              >
                -
              </button>
            )}
          </div>
        ))}
        {/* Add Row Button */}
        <button type="button" className="add-btn" onClick={addRow}>
          +
        </button>

        {/* Toggle Button for Payment Method */}
        <div className="form-group">
          <label>Payment Type:</label>
          <div className="toggle-button">
            <button
              type="button"
              className={`toggle-option ${paymentType === 'CARD' ? 'active' : ''}`}
              onClick={() => handlePaymentTypeToggle('CARD')}
            >
              CARD
            </button>
            <button
              type="button"
              className={`toggle-option ${paymentType === 'CASH' ? 'active' : ''}`}
              onClick={() => handlePaymentTypeToggle('CASH')}
            >
              CASH
            </button>
          </div>
        </div>
  
        {/* Total Amount */}
        <div className="form-group">
          <label>Total Amount ($):</label>
          <input type="number" value={totalAmount} readOnly />
        </div>
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    );
}

export default Modal;
