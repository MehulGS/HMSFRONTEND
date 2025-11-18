import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BMICalculator = () => {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bmiRecords");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecords(parsed);
        }
      }
    } catch (error) {
      setRecords([]);
    }
  }, []);

  const getDietSuggestion = (bmi, status) => {
    const bmiValue = parseFloat(bmi);
    if (!isFinite(bmiValue)) {
      return "Maintain a balanced diet with adequate fruits, vegetables, and water.";
    }

    if (bmiValue < 18.5) {
      return "Increase calorie intake with protein-rich foods, healthy fats, and frequent small meals.";
    }

    if (bmiValue >= 18.5 && bmiValue < 25) {
      return "Continue a balanced diet with whole grains, lean protein, and regular exercise.";
    }

    if (bmiValue >= 25 && bmiValue < 30) {
      return "Reduce refined carbs and sugary drinks, focus on salads, lean protein, and daily walks.";
    }

    return "Follow a calorie-controlled diet, avoid fried foods, and include high-fiber meals.";
  };

  const handleDelete = (id) => {
    const filtered = records.filter((r) => r.id !== id);
    setRecords(filtered);
    try {
      localStorage.setItem("bmiRecords", JSON.stringify(filtered));
    } catch (error) {}
  };

  const handleView = (record) => {
    const suggestion = getDietSuggestion(record.bmi, record.status);
    window.alert(
      `Patient: ${record.name}\nHeight: ${record.height} cm\nWeight: ${record.weight} kg\nBMI: ${record.bmi}\nStatus: ${record.status}\n\nDiet Suggestion:\n${suggestion}`
    );
  };

  const handleEdit = (record) => {
    try {
      localStorage.setItem("bmiEditRecord", JSON.stringify(record));
    } catch (error) {}
    navigate("/doctor/bmi-calculator/new");
  };

  const totalRecords = records.length;
  const averageBmi =
    totalRecords === 0
      ? 0
      : (
          records.reduce((sum, r) => {
            const value = parseFloat(r.bmi);
            return sum + (isFinite(value) ? value : 0);
          }, 0) / totalRecords
        ).toFixed(1);

  const overweightCount = records.filter((r) => r.status === "Overweight").length;

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            BMI Calculator
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track patient BMI, review trends, and get quick diet suggestions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/doctor/bmi-calculator/new")}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-customBlue text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-customBlue"
        >
          <span className="mr-2 text-lg font-bold">+</span>
          Calculate BMI
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-gray-100 bg-white p-3 sm:p-4">
          <p className="text-xs text-gray-500">Total Records</p>
          <p className="mt-1 text-xl font-semibold text-gray-800">{totalRecords}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-3 sm:p-4">
          <p className="text-xs text-gray-500">Average BMI</p>
          <p className="mt-1 text-xl font-semibold text-gray-800">{averageBmi}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-3 sm:p-4">
          <p className="text-xs text-gray-500">Overweight Patients</p>
          <p className="mt-1 text-xl font-semibold text-gray-800">{overweightCount}</p>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Height (cm)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight (kg)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BMI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diet Suggestion
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No BMI records yet. Add a patient to see results.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {record.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{record.height}</td>
                  <td className="px-4 py-3 text-gray-700">{record.weight}</td>
                  <td className="px-4 py-3 text-gray-700">{record.bmi}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        {
                          Overweight: "bg-red-100 text-red-700",
                          Normal: "bg-green-100 text-green-700",
                        }[record.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                    {getDietSuggestion(record.bmi, record.status)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                    <button
                      type="button"
                      onClick={() => handleView(record)}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {records.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
            No BMI records yet. Tap on <span className="font-semibold">Calculate BMI</span> to add a patient.
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="rounded-lg border border-gray-100 bg-white p-4 shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {record.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {record.height} cm • {record.weight} kg
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    BMI {record.bmi}
                  </p>
                  <span
                    className={`mt-1 inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                      {
                        Overweight: "bg-red-100 text-red-700",
                        Normal: "bg-green-100 text-green-700",
                      }[record.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-snug">
                {getDietSuggestion(record.bmi, record.status)}
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleView(record)}
                  className="px-2 py-1 text-[11px] rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(record)}
                  className="px-2 py-1 text-[11px] rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(record.id)}
                  className="px-2 py-1 text-[11px] rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
