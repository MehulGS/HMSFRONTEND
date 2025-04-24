import React, { useEffect, useState } from 'react';
import api from '../api/api';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(null); // 'add', 'edit', 'delete'
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [newName, setNewName] = useState('');

  const fetchMedicines = async () => {
    const res = await api.get('/medicine/');
    setMedicines(res.data.data);
  };
  console.log(medicines)

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAdd = async () => {
    await api.post('/medicine/', { name: newName });
    fetchMedicines();
    setOpenModal(null);
    setNewName('');
  };

  const handleEdit = async () => {
    await api.put(`/medicine/${selectedMedicine._id}`, { name: newName });
    fetchMedicines();
    setOpenModal(null);
    setNewName('');
  };

  const handleDelete = async () => {
    await api.delete(`/medicine/${selectedMedicine._id}`);
    fetchMedicines();
    setOpenModal(null);
    setSelectedMedicine(null);
  };

  const filtered = medicines.filter((med) =>
    med.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search medicine..."
          className="border p-2 rounded w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setOpenModal('add');
            setNewName('');
          }}
        >
          Add Medicine
        </button>
      </div>

      <div className="grid gap-4">
        {filtered.map((med) => (
          <div key={med._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <span className="text-lg font-semibold">{med.name}</span>
            <div className="space-x-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  setSelectedMedicine(med);
                  setNewName(med.name);
                  setOpenModal('edit');
                }}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => {
                  setSelectedMedicine(med);
                  setOpenModal('delete');
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(openModal === 'add' || openModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">{openModal === 'add' ? 'Add Medicine' : 'Edit Medicine'}</h2>
            <input
              type="text"
              placeholder="Medicine Name"
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
            <h2 className="text-lg mb-4">Are you sure you want to delete <strong>{selectedMedicine.name}</strong>?</h2>
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

export default Medicines;
