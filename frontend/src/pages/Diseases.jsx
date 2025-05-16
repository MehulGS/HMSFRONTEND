import React, { useEffect, useState } from 'react';
import api from '../api/api';

const Diseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(null); // 'add', 'edit', 'delete'
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/diseases/');
      if (res.data && res.data.diseases) {
        setDiseases(res.data.diseases);
      } else {
        setDiseases([]);
      }
    } catch (err) {
      setError('Failed to fetch diseases. Please try again later.');
      setDiseases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const handleAdd = async () => {
    try {
      setError(null);
      await api.post('/diseases/', { name: newName });
      await fetchDiseases();
      setOpenModal(null);
      setNewName('');
    } catch (err) {
      setError('Failed to add disease. Please try again.');
    }
  };

  const handleEdit = async () => {
    try {
      setError(null);
      await api.put(`/diseases/${selectedDisease._id}`, { name: newName });
      await fetchDiseases();
      setOpenModal(null);
      setNewName('');
    } catch (err) {
      setError('Failed to update disease. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await api.delete(`/diseases/${selectedDisease._id}`);
      await fetchDiseases();
      setOpenModal(null);
      setSelectedDisease(null);
    } catch (err) {
      setError('Failed to delete disease. Please try again.');
    }
  };

  const filtered = (diseases || []).filter((disease) =>
    disease.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search diseases..."
          className="border p-2 rounded w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            setOpenModal('add');
            setNewName('');
          }}
        >
          Add Disease
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading diseases...</div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {search ? 'No diseases found matching your search.' : 'No diseases available.'}
            </div>
          ) : (
            filtered.map((disease) => (
              <div key={disease._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <span className="text-lg font-semibold">{disease.name}</span>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                      setSelectedDisease(disease);
                      setNewName(disease.name);
                      setOpenModal('edit');
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => {
                      setSelectedDisease(disease);
                      setOpenModal('delete');
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(openModal === 'add' || openModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">{openModal === 'add' ? 'Add Disease' : 'Edit Disease'}</h2>
            <input
              type="text"
              placeholder="Disease Name"
              className="border p-2 rounded w-full mb-4"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setOpenModal(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={openModal === 'add' ? handleAdd : handleEdit}
              >
                {openModal === 'add' ? 'Add' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {openModal === 'delete' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg mb-4">Are you sure you want to delete <strong>{selectedDisease.name}</strong>?</h2>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setOpenModal(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diseases;
