import React, { useState } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const AddDiseaseModal = ({ open, onClose, onSuccess }) => {
  const [diseaseName, setDiseaseName] = useState('');

  const handleAddisease = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/diseases', { name: diseaseName });
      if (response.data.success) {
        toast.success(response.data.message || 'Disease added successfully!');
        onSuccess(response.data.disease);
        onClose()
        setDiseaseName('');
        const input = document.querySelector('input[type="text"]');
        if (input) input.focus();
      } else {
        toast.error(response.data.message || 'Error adding disease');
      }
    } catch (error) {
      console.error('Error adding disease:', error);
      toast.error(error.response?.data?.message || 'Error adding disease');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Disease</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disease Name
            </label>
            <input
              type="text"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter disease name"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddisease}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              Add Disease
            </button>
          </div>

      </div>
    </div>
  );
};

export default AddDiseaseModal; 