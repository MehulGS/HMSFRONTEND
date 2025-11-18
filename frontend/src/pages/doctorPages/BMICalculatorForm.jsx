import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const BMICalculatorForm = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiPreview, setBmiPreview] = useState("");
  const [statusPreview, setStatusPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
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

  const getId = (patient) =>
    patient.id !== undefined && patient.id !== null
      ? String(patient.id)
      : patient._id !== undefined && patient._id !== null
      ? String(patient._id)
      : "";

  const searchTerm = patientSearch.trim().toLowerCase();
  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;
    const name = `${patient.firstName || ""} ${patient.lastName || ""}`.trim().toLowerCase();
    const phoneRaw =
      patient.phone || patient.mobile || patient.contactNumber || patient.phoneNumber || "";
    const phone = phoneRaw.toString().toLowerCase();
    return name.includes(searchTerm) || phone.includes(searchTerm);
  });

  const selectedPatient = patients.find(
    (p) => getId(p) === String(selectedPatientId)
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bmiEditRecord");
      if (!raw) return;
      const record = JSON.parse(raw);
      if (!record) return;

      setEditingId(record.id || null);
      setHeight(record.height ? String(record.height) : "");
      setWeight(record.weight ? String(record.weight) : "");
      if (record.patientId) {
        setSelectedPatientId(String(record.patientId));
      }
    } catch (error) {}
  }, []);

  const getDietSuggestion = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (!isFinite(bmiValue)) {
      return "Maintain a balanced diet with adequate fruits, vegetables, and water.";
    }

    if (bmiValue < 18.5) {
      return "Increase calorie intake with protein-rich foods, healthy fats, and frequent small meals.";
    }

    if (bmiValue >= 18.5 && bmiValue < 25) {
      return "Balanced meals with whole grains, lean protein, fruits, and regular exercise.";
    }

    if (bmiValue >= 25 && bmiValue < 30) {
      return "Cut down on refined carbs and sugar, add salads and lean protein, and stay active.";
    }

    return "Follow a calorie-controlled, high-fiber diet and avoid fried and processed foods.";
  };

  useEffect(() => {
    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);

    if (!heightValue || !weightValue || heightValue <= 0) {
      setBmiPreview("");
      setStatusPreview("");
      return;
    }

    const heightInMeters = heightValue / 100;
    const bmiValue = weightValue / (heightInMeters * heightInMeters);
    const rounded = bmiValue.toFixed(1);
    setBmiPreview(rounded);
    setStatusPreview(bmiValue >= 25 ? "Overweight" : "Normal");
  }, [height, weight]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !height || !weight) return;

    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);
    if (isNaN(heightValue) || isNaN(weightValue) || heightValue <= 0) return;

    const heightInMeters = heightValue / 100;
    const bmiValue = weightValue / (heightInMeters * heightInMeters);
    const status = bmiValue >= 25 ? "Overweight" : "Normal";

    const fullName = selectedPatient
      ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim()
      : "Unknown";

    const newRecord = {
      id: editingId || Date.now(),
      patientId: selectedPatientId,
      name: fullName,
      height: heightValue.toFixed(1),
      weight: weightValue.toFixed(1),
      bmi: bmiValue.toFixed(1),
      status,
    };

    try {
      const existing = localStorage.getItem("bmiRecords");
      const parsed = existing ? JSON.parse(existing) : [];

      let updated;
      if (editingId) {
        updated = (Array.isArray(parsed) ? parsed : []).map((r) =>
          r.id === editingId ? newRecord : r
        );
      } else {
        updated = [newRecord, ...(Array.isArray(parsed) ? parsed : [])];
      }

      localStorage.setItem("bmiRecords", JSON.stringify(updated));
      localStorage.removeItem("bmiEditRecord");
    } catch (error) {}

    navigate("/doctor/bmi-calculator");
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {editingId ? "Edit BMI Record" : "Calculate BMI"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Select a patient, enter height and weight to calculate BMI and get diet guidance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/doctor/bmi-calculator")}
          className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          Back to list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        <form
          id="bmi-form"
          onSubmit={handleSubmit}
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg border border-gray-100 p-4 sm:p-5"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Patient
            </label>
            <div className="mb-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search by name or phone"
                className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
              />
            </div>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue bg-white"
            >
              <option value="">Select patient</option>
              {filteredPatients.map((patient) => {
                const id = getId(patient);
                const name = `${patient.firstName || ""} ${
                  patient.lastName || ""
                }`.trim();
                const genderLabel = patient.gender ? ` (${patient.gender})` : "";
                const phone =
                  patient.phone ||
                  patient.mobile ||
                  patient.contactNumber ||
                  patient.phoneNumber ||
                  "";

                return (
                  <option key={id || name || phone} value={id}>
                    {name || "Unnamed patient"}
                    {genderLabel}
                    {phone ? ` - ${phone}` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedPatient && (
            <div className="md:col-span-2 mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
              <div>
                <p className="text-[11px] text-gray-500">Age</p>
                <p className="text-xs font-medium text-gray-800">
                  {selectedPatient.age !== undefined && selectedPatient.age !== null
                    ? selectedPatient.age
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Gender</p>
                <p className="text-xs font-medium text-gray-800">
                  {selectedPatient.gender || "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Blood Group</p>
                <p className="text-xs font-medium text-gray-800">
                  {selectedPatient.bloodGroup || selectedPatient.blood_group || "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Height (cm)</p>
                <p className="text-xs font-medium text-gray-800">
                  {selectedPatient.height !== undefined && selectedPatient.height !== null
                    ? selectedPatient.height
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Weight (kg)</p>
                <p className="text-xs font-medium text-gray-800">
                  {selectedPatient.weight !== undefined && selectedPatient.weight !== null
                    ? selectedPatient.weight
                    : "-"}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
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

          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
            <button
              type="submit"
              className="inline-flex justify-center items-center px-4 py-2 bg-customBlue text-white rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-customBlue w-full sm:w-auto"
            >
              {editingId ? "Update BMI Record" : "Save & View BMI"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-800">BMI & Diet Preview</h2>
          {bmiPreview ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Calculated BMI</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {bmiPreview}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                      statusPreview === "Overweight"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {statusPreview}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Suggested diet focus
                </p>
                <p className="text-xs text-gray-600 leading-snug">
                  {getDietSuggestion(bmiPreview)}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">
              Enter height and weight to see BMI and tailored diet suggestions here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculatorForm;
