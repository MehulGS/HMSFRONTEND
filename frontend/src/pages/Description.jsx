import React, { useEffect, useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const Description = () => {
  const [discription, setdiscription] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(null); // 'add', 'edit', 'delete'
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [formData, setFormData] = useState({
    description: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to decode HTML entities
  const decodeHtmlEntities = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const fetchdiscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/description');
      console.log(res.data);
      if (res.data && res.data) {
        setdiscription(res.data);
      } else {
        setdiscription([]);
      }
    } catch (err) {
      setError('Failed to fetch discription. Please try again later.');
      toast.error('Failed to fetch discription');
      setdiscription([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdiscription();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = async () => {
    try {
      setError(null);
      if (!formData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      // Decode any HTML entities before sending to API
      const decodedData = {
        ...formData,
        description: decodeHtmlEntities(formData.description)
      };
      await api.post('/description', decodedData);
      await fetchdiscription();
      setOpenModal(null);
      setFormData({ description: '' });
      toast.success('Description added successfully');
    } catch (err) {
      setError('Failed to add description. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to add description');
    }
  };

  const handleEdit = async () => {
    try {
      setError(null);
      if (!formData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      // Decode any HTML entities before sending to API
      const decodedData = {
        ...formData,
        description: decodeHtmlEntities(formData.description)
      };
      await api.put(`/description/${selectedDescription._id}`, decodedData);
      await fetchdiscription();
      setOpenModal(null);
      setFormData({ description: '' });
      toast.success('Description updated successfully');
    } catch (err) {
      setError('Failed to update description. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to update description');
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await api.delete(`/description/${selectedDescription._id}`);
      await fetchdiscription();
      setOpenModal(null);
      setSelectedDescription(null);
      toast.success('Description deleted successfully');
    } catch (err) {
      setError('Failed to delete description. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to delete description');
    }
  };

  const filtered = discription.filter((desc) =>
    desc.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage discription</h1>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            setOpenModal('add');
            setFormData({ description: '' });
          }}
        >
          Add Description
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search discription..."
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading discription...</div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {search ? 'No discription found matching your search.' : 'No discription available.'}
            </div>
          ) : (
            filtered.map((desc) => (
              <div key={desc._id} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-600">{decodeHtmlEntities(desc.description)}</p>
                  <div className="space-x-2 ml-4">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => {
                        setSelectedDescription(desc);
                        setFormData({
                          description: decodeHtmlEntities(desc.description)
                        });
                        setOpenModal('edit');
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => {
                        setSelectedDescription(desc);
                        setOpenModal('delete');
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(openModal === 'add' || openModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[500px]">
            <h2 className="text-xl font-bold mb-4">
              {openModal === 'add' ? 'Add Description' : 'Edit Description'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter description"
                  className="border p-2 rounded w-full h-32 resize-none"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => {
                  setOpenModal(null);
                  setFormData({ description: '' });
                }}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
            <h2 className="text-lg mb-4">
              Are you sure you want to delete this description?
            </h2>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setOpenModal(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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

export default Description;
