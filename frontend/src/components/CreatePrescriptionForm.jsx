import React, { useState, useEffect } from "react";
import { IconButton, Autocomplete, TextField } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/api"; // Adjust the path according to your project structure
import { toast } from "react-toastify";

const CreatePrescriptionForm = ({ onFormUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]); // Add state for medicines list
  const [diseases, setDiseases] = useState([]);
  const [descriptions, setDescriptions] = useState([]);

  // State to manage form values
  const [formValues, setFormValues] = useState({
    appointmentId: id,
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientUniqueId: "",
    disease: "",
    description: "",
    amount: "",
    followUpDate: "",
    followUpTime: "",
    medicines: [
      { 
        medicineName: "",
        dose: "",
        duration: "",
        whenToTake: "",
        isEnabled: true,
      },
      {
        medicineName: "",
        dose: "",
        duration: "",
        whenToTake: "",
        isEnabled: false,
      },
    ],
    additionalNote: "",
    isNewDisease: false,
    isNewDescription: false,
  });

  // State to manage validation errors
  const [errors, setErrors] = useState({});

  const doseOptions = ["1-1-1", "1-1-0", "1-0-1", "1-0-0", "0-1-1", "0-0-1"];
  const whenToTakeOptions = ["Before Food", "After Food", "With Food"];

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const response = await api.get(`/appointments/appointments/${id}`);
        const appointment = response.data.data;

        setFormValues((prevValues) => ({
          ...prevValues,
          patientName: appointment.patientName,
          patientAge: appointment.patientAge,
          patientGender: appointment.patientGender,
          patientUniqueId: appointment.patientUniqueId,
        }));
      } catch (error) {
        console.error("Error fetching appointment details:", error);
      }
    };

    fetchAppointmentDetails();
  }, [id]);

  useEffect(() => {
    onFormUpdate(formValues, id);
  }, [formValues, onFormUpdate, id]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get("/medicine");
        const medicinesArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [];
        setMedicines(medicinesArray);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setMedicines([]);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await api.get("/diseases");
        const diseasesArray = response.data.diseases || [];
        setDiseases(diseasesArray);
      } catch (error) {
        console.error("Error fetching diseases:", error);
        setDiseases([]);
      }
    };

    const fetchDescriptions = async () => {
      try {
        const response = await api.get("/description");
        const descriptionsArray = response.data || [];
        setDescriptions(descriptionsArray);
      } catch (error) {
        console.error("Error fetching descriptions:", error);
        setDescriptions([]);
      }
    };

    fetchDiseases();
    fetchDescriptions();
  }, []);

  // Add function to convert 24h to 12h format
  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Add function to convert 12h to 24h format
  const convertTo24Hour = (time12) => {
    if (!time12) return '';
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (hours === 12) {
      hours = modifier === 'PM' ? 12 : 0;
    } else {
      hours = modifier === 'PM' ? hours + 12 : hours;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'followUpTime') {
      // Convert and log the time in 12-hour format
      const time12Hour = convertTo12Hour(value);
      console.log('Follow-up Time:', time12Hour);
      
      setFormValues({
        ...formValues,
        [name]: value // Store 24h format internally
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formValues.medicines];
    updatedMedicines[index][field] = value;
    setFormValues({ ...formValues, medicines: updatedMedicines });
  };

  const handleAddRow = (index) => {
    const updatedMedicines = [...formValues.medicines];
    updatedMedicines[index].isEnabled = true;

    if (index === formValues.medicines.length - 1) {
      updatedMedicines.push({
        medicineName: "",
        dose: "",
        duration: "",
        whenToTake: "",
        isEnabled: false,
      });
    }

    setFormValues({ ...formValues, medicines: updatedMedicines });
  };

  const handleRemoveMedicine = (index) => {
    const updatedMedicines = formValues.medicines.filter((_, i) => i !== index);
    setFormValues({ ...formValues, medicines: updatedMedicines });
  };

  const handleDiseaseChange = async (_, newValue) => {
    if (newValue && !diseases.find(d => d.name === newValue)) {
      try {
        // Add new disease to the backend
        const response = await api.post("/diseases", { name: newValue });
        const newDisease = response.data.data;
        setDiseases(prev => [...prev, newDisease]);
        setFormValues(prev => ({ ...prev, disease: newDisease.name }));
      } catch (error) {
        console.error("Error adding new disease:", error);
      }
    } else {
      setFormValues(prev => ({ ...prev, disease: newValue || "" }));
    }
  };

  const handleDescriptionChange = async (_, newValue) => {
    if (newValue && !descriptions.find(d => d.description === newValue)) {
      try {
        // Add new description to the backend
        const response = await api.post("/discription", { description: newValue });
        const newDescription = response.data.data;
        setDescriptions(prev => [...prev, newDescription]);
        setFormValues(prev => ({ ...prev, description: newDescription.description }));
      } catch (error) {
        console.error("Error adding new description:", error);
      }
    } else {
      setFormValues(prev => ({ ...prev, description: newValue || "" }));
    }
  };

  // Validation function
  const validateForm = () => {
    let formErrors = {};
    if (!formValues.patientName) formErrors.patientName = "Patient name is required.";
    if (!formValues.patientAge || formValues.patientAge <= 0) formErrors.patientAge = "Valid age is required.";
    if (!formValues.patientGender) formErrors.patientGender = "Gender is required.";

    formValues.medicines.forEach((medicine, index) => {
      if (medicine.isEnabled) {
        if (!medicine.medicineName) formErrors[`medicineName${index}`] = "Medicine name is required.";
        if (!medicine.dose) formErrors[`dose${index}`] = "Dose is required.";
        if (!medicine.duration) formErrors[`duration${index}`] = "Duration is required.";
        if (!medicine.whenToTake) formErrors[`whenToTake${index}`] = "When to take is required.";
      }
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Modify handleSubmit to match API requirements
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');
    
    try {
      // Validate form first
      if (!validateForm()) {
        console.log('Form validation failed:', errors);
        return;
      }
      console.log('Form validation passed');

      // Format medicines data according to API requirements
      const formattedMedicines = formValues.medicines
        .filter(med => med.isEnabled)
        .map(med => {
          const medicineDetails = medicines.find(m => m.name === med.medicineName);
          return {
            medicineId: medicineDetails?._id,
            name: med.medicineName,
            description: medicineDetails?.description || "",
            price: medicineDetails?.price || 0,
            dose: med.dose,
            duration: med.duration,
            whenToTake: med.whenToTake
          };
        });

      console.log('Formatted medicines:', formattedMedicines);

      // Format diseases data
      const diseaseDetails = diseases.find(d => d.name === formValues.disease);
      const formattedDiseases = diseaseDetails ? [{
        _id: diseaseDetails._id,
        name: diseaseDetails.name,
        description: diseaseDetails.description || ""
      }] : [];

      console.log('Formatted diseases:', formattedDiseases);

      // Format description data
      const descriptionDetails = descriptions.find(d => d.description === formValues.description);
      
      // Format follow-up data
      const followUpData = {
        required: true,
        date: formValues.followUpDate,
        time: convertTo12Hour(formValues.followUpTime),
        reason: formValues.additionalNote || "",
        status: 'scheduled',
        notificationSent: false
      };

      console.log('Follow-up data:', followUpData);

      // Prepare the final request data
      const prescriptionData = {
        appointmentId: id,
        medicines: formattedMedicines,
        diseases: formattedDiseases,
        followUp: followUpData,
        amount: formValues.amount || 0,
        addistionalNotes: formValues.additionalNote || "",
        descriptionId: descriptionDetails?._id
      };

      // Log the data being sent
      console.log('Sending Prescription Data:', prescriptionData);

      // Make API call to create prescription
      console.log('Making API call to /prescriptions');
      const response = await api.post('/prescription', prescriptionData);
      console.log('API Response:', response);

      if (response.data) {
        toast.success('Prescription created successfully!');
        // Navigate to today's appointments page
        navigate('/doctor/today-appointments');
      } else {
        toast.error('Failed to create prescription');
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Error creating prescription');
    }
  };

  return (
    <form className="flex flex-col gap-6 bg-white w-full max-w-4xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold">Create Prescription</h2>

      {/* Patient Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative mb-2">
          <input
            type="text"
            name="patientUniqueId"
            value={formValues.patientUniqueId}
            className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none bg-gray-50"
            placeholder=" "
            disabled
          />
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Patient ID
          </label>
          {errors.patientName && <p className="text-red-500 text-sm">{errors.patientUniqueId}</p>}
        </div>

        <div className="relative mb-2">
          <input
            type="text"
            name="patientName"
            value={formValues.patientName}
            className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none bg-gray-50"
            placeholder=" "
            disabled
          />
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Patient Name
          </label>
          {errors.patientName && <p className="text-red-500 text-sm">{errors.patientName}</p>}
        </div>

        <div className="relative mb-2">
          <input
            type="number"
            name="patientAge"
            value={formValues.patientAge}
            className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none bg-gray-50"
            placeholder=" "
            disabled
          />
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Age
          </label>
          {errors.patientAge && <p className="text-red-500 text-sm">{errors.patientAge}</p>}
        </div>

        <div className="relative mb-2">
          <input
            type="text"
            name="patientGender"
            value={formValues.patientGender}
            className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none bg-gray-50"
            placeholder=" "
            disabled
          />
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Gender
          </label>
          {errors.patientGender && <p className="text-red-500 text-sm">{errors.patientGender}</p>}
        </div>
      </div>

      {/* Disease and Description */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative mb-2">
          <Autocomplete
            freeSolo
            options={diseases.map(disease => disease.name)}
            value={formValues.disease}
            onChange={handleDiseaseChange}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.name || '';
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or enter disease"
                className="w-full"
                InputProps={{
                  ...params.InputProps,
                  className: "peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
                }}
              />
            )}
          />
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Disease
          </label>
        </div>

        <div className="relative mb-2">
          <Autocomplete
            freeSolo
            options={descriptions.map(desc => desc.description)}
            value={formValues.description}
            onChange={handleDescriptionChange}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.description || '';
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or enter description"
                className="w-full"
                InputProps={{
                  ...params.InputProps,
                  className: "peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
                }}
              />
            )}
          />
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Description
          </label>
        </div>
      </div>

      {/* Next Follow Up Section */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-2xl font-bold mb-4">Next Follow Up</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative mb-2">
            <input
              type="date"
              name="followUpDate"
              value={formValues.followUpDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
              placeholder=" "
              required
            />
            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
              Follow Up Date
            </label>
          </div>

          <div className="relative mb-2">
            <input
              type="time"
              name="followUpTime"
              value={formValues.followUpTime}
              onChange={handleChange}
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
              placeholder=" "
              required
            />
            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
              Follow Up Time
            </label>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <h2 className="text-3xl font-bold">Drug Prescription</h2>
      <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-4 text-sm font-semibold p-3 mt-0 rounded-t-2xl bg-[#F6F8FB]">
        <div>Medicine Name</div>
        <div>Dose</div>
        <div>Duration</div>
        <div>When to Take</div>
        <div></div>
      </div>

      {formValues.medicines.map((medicine, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-center mb-4"
        >
          <div className="relative">
            <Autocomplete
              options={medicines || []}
              getOptionLabel={(medicine) => medicine?.name || ''}
              value={medicines.find(m => m.name === medicine.medicineName) || null}
              onChange={(_, newValue) => {
                handleMedicineChange(index, "medicineName", newValue ? newValue.name : "");
              }}
              disabled={!medicine.isEnabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Enter Medicine"
                  className="w-full"
                />
              )}
            />
            {errors[`medicineName${index}`] && <p className="text-red-500 text-sm">{errors[`medicineName${index}`]}</p>}
          </div>

          <div className="relative">
            <select
              name={`dose${index}`}
              value={medicine.dose}
              onChange={(e) => handleMedicineChange(index, "dose", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-xl focus:outline-none"
              disabled={!medicine.isEnabled}
            >
              <option value="">Dose</option>
              {doseOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors[`dose${index}`] && <p className="text-red-500 text-sm">{errors[`dose${index}`]}</p>}
          </div>

          <div className="relative">
            <input
              type="text"
              name={`duration${index}`}
              value={medicine.duration}
              onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
              className="peer w-full px-4 py-2 border rounded-xl focus:outline-none"
              placeholder="Duration"
              disabled={!medicine.isEnabled}
            />
            {errors[`duration${index}`] && <p className="text-red-500 text-sm">{errors[`duration${index}`]}</p>}
          </div>

          <div className="relative">
            <select
              name={`whenToTake${index}`}
              value={medicine.whenToTake}
              onChange={(e) => handleMedicineChange(index, "whenToTake", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-xl focus:outline-none"
              disabled={!medicine.isEnabled}
            >
              <option value="">When to take</option>
              {whenToTakeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors[`whenToTake${index}`] && <p className="text-red-500 text-sm">{errors[`whenToTake${index}`]}</p>}
          </div>

          <IconButton
            onClick={() => (medicine.isEnabled ? handleRemoveMedicine(index) : handleAddRow(index))}
            className={medicine.isEnabled ? "text-red-500" : "text-green-500"}
          >
            {medicine.isEnabled ? <DeleteIcon /> : <AddIcon />}
          </IconButton>
        </div>
      ))}

      {/* Additional Note */}
      <div className="relative mb-6">
        <textarea
          name="additionalNote"
          className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 resize-none"
          placeholder=" "
          value={formValues.additionalNote}
          onChange={handleChange}
          rows="2"
        />
        <label
          htmlFor="additionalNote"
          className="absolute left-4 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-4"
        >
          Additional Note
        </label>
      </div>

      {/* Amount Field */}
      <div className="relative mb-6">
        <input
          type="number"
          name="amount"
          value={formValues.amount}
          onChange={handleChange}
          className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
          placeholder=" "
        />
        <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
          Amount
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-600 text-white rounded-xl px-6 py-2 hover:bg-blue-700 transition-colors"
      >
        Send Prescription
      </button>
    </form>
  );
};

export default CreatePrescriptionForm;