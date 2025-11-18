import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const BMICalculator = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await api.get("/bmi-records/get-all-records");
        const payload = response?.data?.data || response?.data;
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error) {
        console.error("Failed to load BMI records", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const getBmiStatus = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (!isFinite(bmiValue)) return "Unknown";
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Normal";
    return "Overweight";
  };

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

  const handleView = (record) => {
    navigate("/doctor/bmi-diet-plan", { state: { record } });
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;
    const id = selectedRecord.id || selectedRecord._id;
    if (!id) return;

    setIsDeleting(true);
    try {
      await api.delete(`/bmi-records/delete-record/${id}`);
      setRecords((prev) => prev.filter((r) => (r.id || r._id) !== id));
    } catch (error) {
      console.error("Failed to delete BMI record", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedRecord(null);
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

  const overweightCount = records.filter((r) => getBmiStatus(r.bmi) === "Overweight").length;

  const filteredRecords = records.filter((record) => {
    const name = (record.name || "").toLowerCase();
    const phone = (record.phoneNumber || "").toString().toLowerCase();
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return name.includes(term) || phone.includes(term);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Search by name or phone number
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Type to search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
          />
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
                Contact
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
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Loading BMI records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No BMI records yet. Add a patient to see results.
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No BMI records match your search.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className={`hover:bg-gray-50 ${
                    getBmiStatus(record.bmi) === "Overweight" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {record.name}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {record.phoneNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{record.height}</td>
                  <td className="px-4 py-3 text-gray-700">{record.weight}</td>
                  <td className="px-4 py-3 text-gray-700">{record.bmi}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        getBmiStatus(record.bmi) === "Overweight"
                          ? "bg-red-100 text-red-700"
                          : getBmiStatus(record.bmi) === "Normal"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {getBmiStatus(record.bmi)}
                    </span>
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
                      onClick={() => handleDeleteClick(record)}
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
        {loading ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
            Loading BMI records...
          </div>
        ) : records.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
            No BMI records yet. Tap on <span className="font-semibold">Calculate BMI</span> to add a patient.
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
            No BMI records match your search.
          </div>
        ) : (
          paginatedRecords.map((record) => (
            <div
              key={record.id}
              className={`rounded-lg border p-4 shadow-xs flex flex-col gap-3 ${
                getBmiStatus(record.bmi) === "Overweight"
                  ? "border-red-200 bg-red-50/70"
                  : "border-gray-100 bg-white"
              }`}
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
                      getBmiStatus(record.bmi) === "Overweight"
                        ? "bg-red-100 text-red-700"
                        : getBmiStatus(record.bmi) === "Normal"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getBmiStatus(record.bmi)}
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
                  onClick={() => handleDeleteClick(record)}
                  className="px-2 py-1 text-[11px] rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {!loading && filteredRecords.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2 self-start sm:self-end">
            <span className="text-xs text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-customBlue"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-600">per page</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded-lg border text-xs sm:text-sm ${currentPage === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded-lg border text-xs sm:text-sm ${currentPage === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete BMI Record</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this BMI record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
