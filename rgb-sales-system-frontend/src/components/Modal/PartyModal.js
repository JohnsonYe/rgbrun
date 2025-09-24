import React, { useState } from "react";
import "./Modal.css";
import Loading from "./Loading";

const PARTY_CREATION_API = "https://ga6s88cd35.execute-api.us-west-1.amazonaws.com/prod/party";

const PACKAGE_OPTIONS = [
    {
        tag: "PRIVATE_GAME_10",
        name: "Private Game Up to 10 People",
        price: 149,
        addOn30MinutesPrice: 50,
        duration: 60
    },
    {
        tag: "PRIVATE_GAME_15",
        name: "Private Game Up to 15 People",
        price: 199,
        addOn30MinutesPrice: 50,
        duration: 60
    },
    {
        tag: "PRIVATE_EVENT_WEEKDAY",
        name: "Private event on weekdays",
        price: 360,
        addOn30MinutesPrice: 100,
        duration: 90
    },
    {
        tag: "PRIVATE_EVENT_WEEKEND",
        name: "Private event on weekends",
        price: 450,
        addOn30MinutesPrice: 100,
        duration: 90
    }
]

function PartyModal({ onClose, globalTodaySales, setGlobalTodaySales}) {
    const [formData, setFormData] = useState({
        eventDate: "",
        eventTime: "",
        customerName: "",
        phoneNumber: "",
        emailAddress: "",
        packageOption: null,
        addOn30Minutes: 0,
        comment: "",
        amount: 0,
        endTime: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle package selection and update amount & end time
    const handlePackageChange = (e) => {
        const selectedPackage = PACKAGE_OPTIONS.find(pkg => pkg.tag === e.target.value);
        setFormData((prevData) => ({
            ...prevData,
            packageOption: selectedPackage,
            amount: calculateAmount(selectedPackage, prevData.addOn30Minutes),
            endTime: calculateEndTime(prevData.eventTime, selectedPackage, prevData.addOn30Minutes),
        }));
    };

    // Handle additional 30-minute sections
    const handleAddOnChange = (e) => {
        const addOnCount = parseInt(e.target.value, 10) || 0;
        setFormData((prevData) => ({
            ...prevData,
            addOn30Minutes: addOnCount,
            amount: calculateAmount(prevData.packageOption, addOnCount),
            endTime: calculateEndTime(prevData.eventTime, prevData.packageOption, addOnCount),
        }));
    };

    // Handle event time change and recalculate end time
    const handleTimeChange = (e) => {
        const eventTime = e.target.value;
        setFormData((prevData) => ({
            ...prevData,
            eventTime,
            endTime: calculateEndTime(eventTime, prevData.packageOption, prevData.addOn30Minutes),
        }));
    };

    // Function to calculate total amount
    const calculateAmount = (selectedPackage, addOnCount) => {
        if (!selectedPackage) return 0;
        return selectedPackage.price + (selectedPackage.addOn30MinutesPrice * addOnCount);
    };

    // Function to calculate end time
    const calculateEndTime = (startTime, selectedPackage, addOnCount) => {
        if (!startTime || !selectedPackage) return "";

        const [hours, minutes] = startTime.split(":").map(Number);
        let totalMinutes = hours * 60 + minutes; // Convert start time to total minutes
        totalMinutes += selectedPackage.duration + (addOnCount * 30); // Add duration and add-on time

        const endHours = Math.floor(totalMinutes / 60) % 24; // Ensure it wraps around 24 hours
        const endMinutes = totalMinutes % 60;

        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        // Construct the request payload
        const requestData = {
            eventDate: formData.eventDate,
            eventTime: formData.eventTime,
            customerName: formData.customerName,
            phoneNumber: formData.phoneNumber,
            emailAddress: formData.emailAddress,
            packageOption: formData.packageOption,
            addOn30Minutes: formData.addOn30Minutes,
            comment: formData.comment,
            amount: formData.amount,
            endTime: formData.endTime,
        };

        try {
            setIsSubmitting(true);
            const response = await fetch(PARTY_CREATION_API, {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Booking Successful:", responseData);

            const url = new URL(window.location.href);
            url.searchParams.set("fromDate", formData.eventDate);
            url.searchParams.delete("toDate");
            window.history.pushState({}, "", url);
            onClose();
        } catch(error) {
            console.error("Error submitting booking:", error);
            alert("Failed to submit booking. Please try again or call Johnson");
        } finally {
            setIsSubmitting(false);
            window.location.reload();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
          {isSubmitting && <Loading />}
          <div className="modal" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Event Date</label>
                    <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Event Start Time</label>
                    <input type="time" name="eventTime" value={formData.eventTime} onChange={handleTimeChange} required />
                </div>

                <div className="form-group">
                    <label>Event End Time</label>
                    <input type="text" value={formData.endTime || "Select start time and package"} readOnly />
                </div>

                <div className="form-group">
                    <label>Package Options</label>
                    <select className="party-package-selection" name="packageOption" onChange={handlePackageChange} required>
                        <option value="">Select Package</option>
                        {PACKAGE_OPTIONS.map((pkg) => (
                        <option key={pkg.tag} value={pkg.tag}>
                            {pkg.name} (${pkg.price})
                        </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Customer Name</label>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Additional 30-Minute Sections</label>
                    <input type="number" name="addOn30Minutes" value={formData.addOn30Minutes} onChange={handleAddOnChange} min="0" />
                </div>

                <div className="form-group">
                    <label>Comment (Number of Participants, Additional Info)</label>
                    <textarea name="comment" value={formData.comment} onChange={handleChange} rows="3" />
                </div>

                <div className="form-group">
                    <label>Total Amount</label>
                    <input type="text" value={`$${formData.amount}`} readOnly />
                </div>

                <button type="submit" className="submit-button">Submit</button>
            </form>
          
    
            <button type="button" className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      );
}
export default PartyModal;