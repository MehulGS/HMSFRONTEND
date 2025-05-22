import React, { useState, useEffect } from "react";
import { IconButton, Autocomplete, TextField, Modal, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/api"; // Adjust the path according to your project structure
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const CreatePrescriptionInvoice = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]); // New: all patients
  const [selectedPatient, setSelectedPatient] = useState(null); // New: selected patient
  const [medicines, setMedicines] = useState([]); // Add state for medicines list
  const [diseases, setDiseases] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [newDiseaseValue, setNewDiseaseValue] = useState("");
  const [newDescriptionValue, setNewDescriptionValue] = useState("");
  const [selectedDiseases, setSelectedDiseases] = useState([]); // New state for multiple diseases
  const [selectedDescriptions, setSelectedDescriptions] = useState([]); // New state for multiple descriptions

  // State to manage form values
  const [formValues, setFormValues] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientUniqueId: "",
    diseases: [],
    descriptions: [], // Changed from single description to array
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

  // Fetch all patients on mount
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

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get("/medicine");
        const medicinesArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [];
        setMedicines(medicinesArray);
      } catch (error) {
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
        setDiseases([]);
      }
    };

    const fetchDescriptions = async () => {
      try {
        const response = await api.get("/description");
        const descriptionsArray = response.data || [];
        setDescriptions(descriptionsArray);
      } catch (error) {
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

  // When a patient is selected, update form values
  const handlePatientSelect = (event, value) => {
    setSelectedPatient(value);
    if (value) {
      setFormValues((prev) => ({
        ...prev,
        patientName: `${value.firstName} ${value.lastName}`,
        patientAge: value.age,
        patientGender: value.gender,
        patientUniqueId: value.patientUniqueId,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        patientName: "",
        patientAge: "",
        patientGender: "",
        patientUniqueId: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'followUpTime') {
      // Convert and log the time in 12-hour format
      const time12Hour = convertTo12Hour(value);
      
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
      setNewDiseaseValue(newValue);
      setIsDiseaseModalOpen(true);
    } else if (newValue) {
      // Add the disease to selectedDiseases if it's not already there
      if (!selectedDiseases.find(d => d.name === newValue)) {
        const diseaseToAdd = diseases.find(d => d.name === newValue);
        setSelectedDiseases(prev => [...prev, diseaseToAdd]);
        setFormValues(prev => ({
          ...prev,
          diseases: [...prev.diseases, diseaseToAdd]
        }));
      }
    }
  };

  const handleRemoveDisease = (diseaseToRemove) => {
    setSelectedDiseases(prev => prev.filter(d => d.name !== diseaseToRemove.name));
    setFormValues(prev => ({
      ...prev,
      diseases: prev.diseases.filter(d => d.name !== diseaseToRemove.name)
    }));
  };

  const handleDescriptionChange = async (_, newValue) => {
    if (newValue && !descriptions.find(d => d.description === newValue)) {
      setNewDescriptionValue(newValue);
      setIsDescriptionModalOpen(true);
    } else if (newValue) {
      // Add the description to selectedDescriptions if it's not already there
      if (!selectedDescriptions.find(d => d.description === newValue)) {
        const descriptionToAdd = descriptions.find(d => d.description === newValue);
        if (descriptionToAdd) {
          setSelectedDescriptions(prev => [...prev, descriptionToAdd]);
          setFormValues(prev => ({
            ...prev,
            descriptions: [...prev.descriptions, descriptionToAdd]
          }));
        }
      }
    }
  };

  const handleRemoveDescription = (descriptionToRemove) => {
    setSelectedDescriptions(prev => prev.filter(d => d.description !== descriptionToRemove.description));
    setFormValues(prev => ({
      ...prev,
      descriptions: prev.descriptions.filter(d => d.description !== descriptionToRemove.description)
    }));
  };

  const handleCreateDisease = async () => {
    try {
      const response = await api.post("/diseases", { name: newDiseaseValue });
      const newDisease = response.data.disease;
      if (newDisease) {
        setDiseases(prev => [...prev, newDisease]);
        setSelectedDiseases(prev => [...prev, newDisease]);
        setFormValues(prev => ({
          ...prev,
          diseases: [...prev.diseases, newDisease]
        }));
        setIsDiseaseModalOpen(false);
        setNewDiseaseValue("");
        toast.success('Disease created successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error adding new disease:", error);
      toast.error(error.response?.data?.message || 'Failed to create disease');
    }
  };

  const handleCreateDescription = async () => {
    try {
      const response = await api.post("/description", { description: newDescriptionValue });
      const newDescription = response.data.description || response.data;
      if (newDescription) {
        setDescriptions(prev => [...prev, newDescription]);
        setSelectedDescriptions(prev => [...prev, newDescription]);
        setFormValues(prev => ({
          ...prev,
          descriptions: [...prev.descriptions, newDescription]
        }));
        setIsDescriptionModalOpen(false);
        setNewDescriptionValue("");
        toast.success('Description created successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error adding new description:", error);
      toast.error(error.response?.data?.message || 'Failed to create description');
    }
  };

  // Validation function
  const validateForm = () => {
    let formErrors = {};
    if (!formValues.patientName) formErrors.patientName = "Patient name is required.";
    if (!formValues.patientAge || formValues.patientAge <= 0) formErrors.patientAge = "Valid age is required.";
    if (!formValues.patientGender) formErrors.patientGender = "Gender is required.";
    if (formValues.diseases.length === 0) formErrors.diseases = "At least one disease is required.";
    if (formValues.descriptions.length === 0) formErrors.descriptions = "At least one description is required.";

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
    
    try {
      // Validate form first
      if (!validateForm()) {
        toast.error('Form validation failed:', errors);
        return;
      }

      // Get hospitalId from token
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const hospitalId = decoded.adminhospital;
      const role = decoded.role;

      // Get patientId from selectedPatient
      const patientId = selectedPatient?._id;

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


      // Format diseases data - now handling multiple diseases
      const formattedDiseases = formValues.diseases.map(disease => ({
        _id: disease._id,
        name: disease.name,
        description: disease.description || ""
      }));


      // Format descriptions data - use the _id directly from the description object
      const formattedDescriptions = formValues.descriptions.map(description => ({
        descriptionId: description._id, // Use _id directly from the description object
        description: description.description
      }));


      // Format follow-up data - make it conditional and truly optional
      const followUpData = formValues.followUpDate && formValues.followUpTime ? {
        required: false,
        date: formValues.followUpDate,
        time: convertTo12Hour(formValues.followUpTime),
        reason: formValues.additionalNote ? ` ${formValues.additionalNote}` : "",
        status: 'scheduled',
        notificationSent: false
      } : null;


      // Prepare the final request data
      const prescriptionData = {
        medicines: formattedMedicines,
        diseases: formattedDiseases,
        descriptions: formattedDescriptions,
        followUp: followUpData,
        amount: formValues.amount || 0,
        addistionalNotes: formValues.additionalNote ? ` ${formValues.additionalNote}` : "",
        hospitalId, // Add hospitalId from token
        patientId,  // Add patientId from selected patient
      };

      // Log the data being sent

      // Make API call to create prescription
      const response = await api.post('/prescription', prescriptionData);

     
        toast.success('Prescription created successfully!');
        // Navigate to today's appointments page
        navigate(`/${role}/today-appointments`);
      
       
      
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

  // Modal styles
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <form className="flex flex-col gap-6 bg-white w-full  mx-auto p-8" onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold">Create Prescription</h2>

      {/* Patient Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative mb-2 col-span-3">
          <Autocomplete
            options={patients}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.patientUniqueId || ''})`}
            value={selectedPatient}
            onChange={handlePatientSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Patient"
                placeholder="Search patient by name or ID"
                className="w-full"
              />
            )}
          />
        </div>
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
        </div>
      </div>

      {/* Disease and Description */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative mb-2">
          <div className="flex gap-2 mb-2">
            <Autocomplete
              freeSolo
              options={diseases.map(disease => disease.name)}
              value=""
              onChange={handleDiseaseChange}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.name || '';
              }}
              renderOption={(props, option) => {
                const isNew = !diseases.find(d => d.name === option);
                return (
                  <li {...props} className="flex justify-between items-center p-2">
                    <span>{option}</span>
                    {isNew && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewDiseaseValue(option);
                          setIsDiseaseModalOpen(true);
                        }}
                        sx={{ ml: 1 }}
                      >
                        Create New
                      </Button>
                    )}
                  </li>
                );
              }}
              renderInput={(params) => (
                <div className="relative flex-grow">
                  <TextField
                    {...params}
                    placeholder="Add disease"
                    className="w-full"
                    InputProps={{
                      ...params.InputProps,
                      className: "peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
                    }}
                  />
                </div>
              )}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setNewDiseaseValue("");
                setIsDiseaseModalOpen(true);
              }}
              sx={{ minWidth: '120px' }}
            >
              Create New
            </Button>
          </div>
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Add Disease
          </label>
          {errors.diseases && <p className="text-red-500 text-sm">{errors.diseases}</p>}
          
          {/* Display selected diseases */}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedDiseases.map((disease) => (
              <div
                key={disease._id}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                <span>{disease.name}</span>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveDisease(disease)}
                  className="text-blue-800 hover:text-blue-900"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mb-2">
          <div className="flex gap-2 mb-2">
            <Autocomplete
              freeSolo
              options={descriptions.map(desc => desc.description)}
              value=""
              onChange={handleDescriptionChange}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.description || '';
              }}
              renderOption={(props, option) => {
                const isNew = !descriptions.find(d => d.description === option);
                return (
                  <li {...props} className="flex justify-between items-center p-2">
                    <span>{option}</span>
                    {isNew && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewDescriptionValue(option);
                          setIsDescriptionModalOpen(true);
                        }}
                        sx={{ ml: 1 }}
                      >
                        Create New
                      </Button>
                    )}
                  </li>
                );
              }}
              renderInput={(params) => (
                <div className="relative flex-grow">
                  <TextField
                    {...params}
                    placeholder="Add description"
                    className="w-full"
                    InputProps={{
                      ...params.InputProps,
                      className: "peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
                    }}
                  />
                </div>
              )}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setNewDescriptionValue("");
                setIsDescriptionModalOpen(true);
              }}
              sx={{ minWidth: '120px' }}
            >
              Create New
            </Button>
          </div>
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
            Add Description
          </label>
          {errors.descriptions && <p className="text-red-500 text-sm">{errors.descriptions}</p>}
          
          {/* Display selected descriptions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedDescriptions.map((description) => (
              <div
                key={description._id}
                className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full"
              >
                <span>{description.description}</span>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveDescription(description)}
                  className="text-green-800 hover:text-green-900"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Follow Up Section - Make fields optional */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-2xl font-bold mb-4">Next Follow Up (Optional)</h2>
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
            />
            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
              Follow Up Date (Optional)
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
            />
            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 transition-all duration-200">
              Follow Up Time (Optional)
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
          placeholder="Enter any additional notes, follow-up instructions, or special considerations for the patient..."
          value={formValues.additionalNote}
          onChange={handleChange}
          rows="3"
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

      {/* Disease Creation Modal */}
      <Modal
        open={isDiseaseModalOpen}
        onClose={() => setIsDiseaseModalOpen(false)}
        aria-labelledby="disease-modal-title"
      >
        <Box sx={modalStyle}>
          <h2 id="disease-modal-title" className="text-xl font-bold mb-4">Create New Disease</h2>
          <TextField
            fullWidth
            label="Disease Name"
            value={newDiseaseValue}
            onChange={(e) => setNewDiseaseValue(e.target.value)}
            className="mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDiseaseModalOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleCreateDisease}
              disabled={!newDiseaseValue.trim()}
            >
              Create Disease
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Description Creation Modal */}
      <Modal
        open={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        aria-labelledby="description-modal-title"
      >
        <Box sx={modalStyle}>
          <h2 id="description-modal-title" className="text-xl font-bold mb-4">Create New Description</h2>
          <TextField
            fullWidth
            label="Description"
            value={newDescriptionValue}
            onChange={(e) => setNewDescriptionValue(e.target.value)}
            className="mb-4"
            multiline
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDescriptionModalOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleCreateDescription}
              disabled={!newDescriptionValue.trim()}
            >
              Create Description
            </Button>
          </div>
        </Box>
      </Modal>
    </form>
  );
};

export default CreatePrescriptionInvoice;