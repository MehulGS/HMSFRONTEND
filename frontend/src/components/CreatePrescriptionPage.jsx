import React, { useState } from 'react';
import CreatePrescriptionForm from './CreatePrescriptionForm';

const CreatePrescriptionPage = () => {
  const [appointmentId, setAppointmentId] = useState(null);

  const handleFormUpdate = (data, id) => {
    setAppointmentId(id);
  };

  return (
    <div className="bg-gray-100 min-h-full">
      <div className="bg-white p-6 rounded-xl shadow-lg h-full max-w-4xl mx-auto">
        <CreatePrescriptionForm onFormUpdate={handleFormUpdate} />
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;
