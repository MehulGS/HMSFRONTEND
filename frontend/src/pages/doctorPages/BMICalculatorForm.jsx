import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const BMICalculatorForm = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get("/users/patients");
        setPatients(response.data || []);
      } catch (error) {
        setPatients([]);
      }
    };

    fetchPatients();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !height || !weight) return;

    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);
    if (isNaN(heightValue) || isNaN(weightValue) || heightValue <= 0) return;

    const heightInMeters = heightValue / 100; // cm to meters
    const bmiValue = weightValue / (heightInMeters * heightInMeters);
    const status = bmiValue >= 25 ? "Overweight" : "Normal";

    const getId = (patient) =>
      patient.id !== undefined && patient.id !== null
        ? String(patient.id)
        : patient._id !== undefined && patient._id !== null
        ? String(patient._id)
        : "";

    const selectedPatient = patients.find(
      (p) => getId(p) === String(selectedPatientId)
    );

    const fullName = selectedPatient
      ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim()
      : "Unknown";

    const newRecord = {
      id: Date.now(),
      name: fullName,
      height: heightValue.toFixed(1),
      weight: weightValue.toFixed(1),
      bmi: bmiValue.toFixed(1),
      status,
    };

    try {
      const existing = localStorage.getItem("bmiRecords");
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newRecord, ...(Array.isArray(parsed) ? parsed : [])];
      localStorage.setItem("bmiRecords", JSON.stringify(updated));
    } catch (error) {
      // ignore localStorage errors
    }

    navigate("/doctor/bmi-calculator");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Calculate BMI</h1>
      </div>

      <form
        id="bmi-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue bg-white"
          >
            <option value="">Select patient</option>
            {patients.map((patient) => {
              const id =
                patient.id !== undefined && patient.id !== null
                  ? String(patient.id)
                  : patient._id !== undefined && patient._id !== null
                  ? String(patient._id)
                  : "";

              const name = `${patient.firstName || ""} ${
                patient.lastName || ""
              }`.trim();

              return (
                <option key={id || name} value={id}>
                  {name || "Unnamed patient"}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
            placeholder="Enter height in cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
            placeholder="Enter weight in kg"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-customBlue text-white rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none"
          >
            Save & View BMI
          </button>
        </div>
      </form>
    </div>
  );
};

export default BMICalculatorForm;
