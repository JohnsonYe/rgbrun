import React, { useState } from "react";
import { GAME_PRICE, GAME_TYPE, CHALLENGE_GAME_PRICE, SALES_TYPE } from "../../constants/GameConstant";
import DFRINK_ITEM_LIST from "../../constants/DrinkConstant";
import Loading from "./Loading";
import "./Modal.css";

const SALES_CREATION_API = "https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/sales";

function Modal({ onClose, globalTodaySales, setGlobalTodaySales }) {
    const [activeForm, setActiveForm] = useState("Sales");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Create Sale</h2>
                        <p className="modal-subtitle">Record a new transaction.</p>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="form-switch">
                    <button
                        className={`form-switch-btn ${activeForm === "Sales" ? "active" : ""}`}
                        onClick={() => setActiveForm("Sales")}
                    >
                        Games
                    </button>
                    <button
                        className={`form-switch-btn ${activeForm === "Drinks" ? "active" : ""}`}
                        onClick={() => setActiveForm("Drinks")}
                    >
                        Drinks
                    </button>
                </div>

                {activeForm === "Sales" ? (
                    <SalesForm
                        globalTodaySales={globalTodaySales}
                        setGlobalTodaySales={setGlobalTodaySales}
                        onClose={onClose}
                    />
                ) : (
                    <DrinksForm
                        globalTodaySales={globalTodaySales}
                        setGlobalTodaySales={setGlobalTodaySales}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
}

function SalesForm({ globalTodaySales, setGlobalTodaySales, onClose }) {
    const [quantity, setQuantity] = useState(2);
    const [kidQuantity, setKidQuantity] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(quantity * GAME_PRICE[quantity]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comment, setComment] = useState("");
    const [paymentType, setPaymentType] = useState("CARD");
    const [gameType, setGameType] = useState(GAME_TYPE.NORMAL);
    const [isCommentUpdated, setIsCommentUpdated] = useState(false);

    const calculateTotal = (adultQty, kidQty, disc, type = GAME_TYPE.NORMAL) => {
        let pricePerPerson = 0;
        const totalQty = adultQty + kidQty;

        if (type === GAME_TYPE.CHALLENGE) {
            pricePerPerson = CHALLENGE_GAME_PRICE;
        } else {
            if (totalQty < 2) pricePerPerson = GAME_PRICE[2];
            else if (totalQty > 10) pricePerPerson = GAME_PRICE[10];
            else pricePerPerson = GAME_PRICE[totalQty];
        }

        const baseAmount = adultQty * pricePerPerson;
        const baseKidAmount = kidQty * pricePerPerson * 0.5;
        const discountedAmount = baseAmount - baseAmount * (disc / 100) + baseKidAmount;
        const roundedAmount = Math.ceil(discountedAmount * 100) / 100;

        setComment(adultQty + " adults and " + kidQty + " kids under 4ft");
        setTotalAmount(roundedAmount);
        setIsCommentUpdated(true);
        return roundedAmount;
    };

    const handleQuantityChange = (e) => {
        const qty = Math.max(parseInt(e.target.value, 10), 0);
        setQuantity(qty);
        calculateTotal(qty, kidQuantity, discount, gameType);
    };

    const handleKidQuantityChange = (e) => {
        const qty = Math.max(parseInt(e.target.value, 10), 0);
        setKidQuantity(qty);
        calculateTotal(quantity, qty, discount, gameType);
    };

    const handleDiscountChange = (e) => {
        const disc = Math.max(0, parseFloat(e.target.value) || 0);
        setDiscount(disc);
        calculateTotal(quantity, kidQuantity, disc, gameType);
    };

    const handleTotalAmountChange = (e) => {
        const originalTotalAmount = calculateTotal(quantity, kidQuantity, discount, gameType);
        const overridedAmount = Math.max(0, parseFloat(e.target.value) || 0);
        setTotalAmount(overridedAmount);
        setComment(
            `Override amount: $${overridedAmount}, Original amount: $${originalTotalAmount} for ${quantity} adults and ${kidQuantity} kids under 3.5ft`
        );
    };

    const handlePaymentTypeToggle = (method) => {
        setPaymentType(method);
        calculateTotal(quantity, kidQuantity, discount, gameType);
    };

    const handleGameTypeToggle = (type) => {
        setGameType(type);
        calculateTotal(quantity, kidQuantity, discount, type);
    };

    const handleSaleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        let manualComment = comment;
        if (!isCommentUpdated) {
            setComment(quantity + " adults and 0 kids under 4ft");
            manualComment = quantity + " adults and 0 kids under 4ft";
        }

        const salesData = {
            quantity: quantity + kidQuantity,
            totalAmount,
            discount,
            comment: manualComment,
            paymentType,
            salesType: SALES_TYPE.GAME,
            gameType,
        };

        try {
            const response = await fetch(SALES_CREATION_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(salesData),
            });

            if (response.ok) {
                const result = await response.json();
                setGlobalTodaySales([...globalTodaySales, result.salesData]);
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
            setQuantity(2);
            setKidQuantity(0);
            setDiscount(0);
            setComment("");
            setGameType(GAME_TYPE.NORMAL);
            setIsCommentUpdated(false);
            onClose();
        } catch (err) {
            alert("Network error. Please try again or call 925-330-2206 for technical support");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isSubmitting && <Loading />}
            <form onSubmit={handleSaleSubmit}>
                <div className="form-group">
                    <label>Game Type</label>
                    <div className="toggle-button">
                        <button
                            type="button"
                            className={`toggle-option ${gameType === GAME_TYPE.NORMAL ? "active" : ""}`}
                            onClick={() => handleGameTypeToggle(GAME_TYPE.NORMAL)}
                        >
                            Normal
                        </button>
                        <button
                            type="button"
                            className={`toggle-option ${gameType === GAME_TYPE.CHALLENGE ? "active" : ""}`}
                            onClick={() => handleGameTypeToggle(GAME_TYPE.CHALLENGE)}
                        >
                            Challenge
                        </button>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Adults</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group">
                        <label>Kids (under 4ft)</label>
                        <input
                            type="number"
                            value={kidQuantity}
                            onChange={handleKidQuantityChange}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Discount (%)</label>
                    <input
                        type="number"
                        value={discount}
                        onChange={handleDiscountChange}
                        placeholder="0"
                    />
                </div>

                <div className="amount-preview">
                    <div>
                        <div className="amount-label">Total Amount</div>
                        <div className="amount-value">${Number(totalAmount).toFixed(2)}</div>
                    </div>
                    <input
                        type="number"
                        className="amount-input"
                        value={totalAmount}
                        onChange={handleTotalAmountChange}
                        placeholder={totalAmount}
                    />
                </div>

                <div className="form-group">
                    <label>Payment Type</label>
                    <div className="toggle-button">
                        <button
                            type="button"
                            className={`toggle-option ${paymentType === "CARD" ? "active" : ""}`}
                            onClick={() => handlePaymentTypeToggle("CARD")}
                        >
                            Card
                        </button>
                        <button
                            type="button"
                            className={`toggle-option ${paymentType === "CASH" ? "active" : ""}`}
                            onClick={() => handlePaymentTypeToggle("CASH")}
                        >
                            Cash
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Comment</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Any notes..."
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Record Sale
                </button>
            </form>
        </>
    );
}

function DrinksForm({ globalTodaySales, setGlobalTodaySales, onClose }) {
    const [rows, setRows] = useState([{ drink: "", quantity: 1, price: 0 }]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentType, setPaymentType] = useState("CARD");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDrinkChange = (index, value) => {
        const updatedRows = [...rows];
        const selectedDrink = DFRINK_ITEM_LIST.find((item) => item.name === value);
        updatedRows[index].drink = value;
        updatedRows[index].price = selectedDrink ? selectedDrink.price : 0;
        setRows(updatedRows);
        calculateTotal(updatedRows);
    };

    const handlePaymentTypeToggle = (method) => setPaymentType(method);

    const handleQuantityChange = (index, value) => {
        const qty = Math.max(1, parseInt(value, 10) || 1);
        const updatedRows = [...rows];
        updatedRows[index].quantity = qty;
        setRows(updatedRows);
        calculateTotal(updatedRows);
    };

    const addRow = () => setRows([...rows, { drink: "", quantity: 1, price: 0 }]);

    const removeRow = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
        calculateTotal(updatedRows);
    };

    const calculateTotal = (rows) => {
        const total = rows.reduce((sum, row) => sum + row.quantity * row.price, 0);
        setTotalAmount(Math.ceil(total * 100) / 100);
    };

    const handleSaleSubmit = async (e) => {
        e.preventDefault();
        let quantity = 0;
        let amount = 0;
        let comments = [];
        rows.forEach((row) => {
            quantity += row.quantity;
            amount += row.quantity * row.price;
            comments.push(row.drink + ": " + quantity);
        });

        if (amount <= 0) {
            alert("Please select a drink before submit.");
            return;
        }

        const salesData = {
            quantity,
            totalAmount: amount,
            discount: 0,
            comment: comments.join(", "),
            paymentType,
            salesType: SALES_TYPE.DRINK,
            gameType: "",
        };
        setIsSubmitting(true);

        try {
            const response = await fetch(SALES_CREATION_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(salesData),
            });

            if (response.ok) {
                const result = await response.json();
                setGlobalTodaySales([...globalTodaySales, result.salesData]);
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
            onClose();
        } catch (err) {
            alert("Network error. Please try again or call 925-330-2206 for technical support");
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    return (
        <>
            {isSubmitting && <Loading />}
            <form onSubmit={handleSaleSubmit}>
                {rows.map((row, index) => (
                    <div key={index} className="drink-row">
                        <select
                            value={row.drink}
                            onChange={(e) => handleDrinkChange(index, e.target.value)}
                        >
                            <option value="">Select a drink</option>
                            {DFRINK_ITEM_LIST.map((item) => (
                                <option key={item.id} value={item.name}>
                                    {item.name} — ${item.price}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            placeholder="Qty"
                        />
                        {rows.length > 1 ? (
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeRow(index)}
                                aria-label="Remove"
                            >
                                ×
                            </button>
                        ) : (
                            <span style={{ width: "36px" }} />
                        )}
                    </div>
                ))}

                <button type="button" className="add-btn" onClick={addRow}>
                    + Add another drink
                </button>

                <div className="form-group" style={{ marginTop: "16px" }}>
                    <label>Payment Type</label>
                    <div className="toggle-button">
                        <button
                            type="button"
                            className={`toggle-option ${paymentType === "CARD" ? "active" : ""}`}
                            onClick={() => handlePaymentTypeToggle("CARD")}
                        >
                            Card
                        </button>
                        <button
                            type="button"
                            className={`toggle-option ${paymentType === "CASH" ? "active" : ""}`}
                            onClick={() => handlePaymentTypeToggle("CASH")}
                        >
                            Cash
                        </button>
                    </div>
                </div>

                <div className="amount-preview">
                    <div>
                        <div className="amount-label">Total Amount</div>
                        <div className="amount-value">${Number(totalAmount).toFixed(2)}</div>
                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    Record Sale
                </button>
            </form>
        </>
    );
}

export default Modal;
