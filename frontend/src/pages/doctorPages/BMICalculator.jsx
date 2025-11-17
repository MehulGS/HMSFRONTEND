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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">BMI Calculator</h1>
        <button
          type="button"
          onClick={() => navigate("/doctor/bmi-calculator/new")}
          className="inline-flex items-center px-4 py-2 bg-customBlue text-white rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none"
        >
          <span className="mr-2 text-lg font-bold">+</span>
          Calculate BMI
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Height (cm)
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight (kg)
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BMI
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No BMI records yet. Add a patient to see results.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {record.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {record.height}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {record.weight}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {record.bmi}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${{
                        Overweight: "bg-red-100 text-red-700",
                        Normal: "bg-green-100 text-green-700",
                      }[record.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BMICalculator;
