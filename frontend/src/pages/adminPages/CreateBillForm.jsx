import { useEffect, useState } from "react";
import {
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Autocomplete,
} from "@mui/material";
import api from "../../api/api"; // Assuming your API utility is setup
import selectImage from "../../assets/images/select-image.png"; // Placeholder image path
import AddFieldModal from "../../components/modals/AddFieldModal";
import { Delete } from "@mui/icons-material";
import { AiOutlineDelete } from "react-icons/ai";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const CreateBill = () => {
  const [hospitalFields, setHospitalFields] = useState([]);
  const [patientFields, setPatientFields] = useState([]);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const token =localStorage.getItem("token")
  const decoded=jwtDecode(token)
  const role=decoded.role
  const navigate=useNavigate()

  // Add new state for bill number
  const [lastBillNumber, setLastBillNumber] = useState(0);

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  const getCurrentTime = () => {
    return new Date().toTimeString().split(" ")[0].slice(0, 5); // "HH:MM"
  };

  const [formValues, setFormValues] = useState({
    hospitalId: "",
    hospitalName: "",
    hospitalAddress: "",
    otherText: "",
    billDate: getCurrentDate(),
    billTime: getCurrentTime(),
    billNumber: "",
    phoneNumber: "",
    email: "",
    address: "",
    patientId: "",
    patientName: "",
    patientPhoneNumber: "",
    patientEmail: "",
    diseaseName: "",
    doctorName: "",
    description: "",
    amount: "",
    tax: "",
    doctorId: "",
    discount: "",
    totalAmount: "",
    paymentType: "Cash",
    gender: "Male",
    age: "",
    insuranceCompany: "",
    insurancePlan: "",
    claimAmount: "",
    claimedAmount: "",
    status: "Unpaid",
    logoUrl: "",
  });

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get("/hospitals/hospitals");
        setHospitals(response.data.data);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      }
    };
    fetchHospitals();
  }, []);

  // Recalculate total when amount / tax / discount change
  useEffect(() => {
    if (formValues.amount && formValues.tax && formValues.discount !== null) {
      const amount = parseFloat(formValues.amount);
      const tax = parseFloat(formValues.tax);
      const discount = parseFloat(formValues.discount);
      const calculatedTotal = amount + amount * (tax / 100) - discount;
      setFormValues((prev) => ({
        ...prev,
        totalAmount: calculatedTotal.toFixed(2),
      }));
    }
  }, [formValues.amount, formValues.tax, formValues.discount]);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get("/users/patients");
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, []);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/users/doctors");
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get("/medicine");
        // Make sure we're getting an array from the response
        const medicinesArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [];
        setMedicines(medicinesArray);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setMedicines([]); // Set empty array on error
      }
    };
    fetchMedicines();
  }, []);

  // Add useEffect to fetch total bills and set bill number
  useEffect(() => {
    const fetchLastBillNumber = async () => {
      try {
        const response = await api.get("/invoices");
        const bills = response.data.data || [];
        // Find the highest bill number
        const highestBillNumber = bills.reduce((max, bill) => {
          const currentNumber = parseInt(bill.billNumber?.replace(/\D/g, '') || '0');
          return Math.max(max, currentNumber);
        }, 0);
        
        // Set the new bill number (highest + 1)
        const newBillNumber = `BILL${(highestBillNumber + 1).toString().padStart(6, '0')}`;
        console.log("Generated new bill number:", newBillNumber);
        
        setLastBillNumber(highestBillNumber);
        setFormValues(prev => ({
          ...prev,
          billNumber: newBillNumber
        }));
      } catch (error) {
        console.error("Error fetching bills:", error);
        // Fallback bill number if API fails
        const fallbackBillNumber = `BILL${(1).toString().padStart(6, '0')}`;
        setFormValues(prev => ({
          ...prev,
          billNumber: fallbackBillNumber
        }));
      }
    };

    fetchLastBillNumber();
  }, []);

  // Update the handleSubmit function to prevent bill number modification
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent manual changes to bill number
    if (name === 'billNumber') return;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle hospital selection
  const handleHospitalSelect = (e) => {
    const selectedHospital = hospitals.find((h) => h._id === e.target.value);
    if (!selectedHospital) return;
    setFormValues((prev) => ({
      ...prev,
      hospitalId: selectedHospital._id,
      hospitalName: selectedHospital.name,
      hospitalAddress: selectedHospital.address,
      phoneNumber: selectedHospital.phone,
      email: selectedHospital.email,
      logoUrl: selectedHospital.logoUrl,
    }));
  };

  // Handle patient selection
  const handlePatientSelectByObject = (patient) => {
    if (!patient) {
      setFormValues((prev) => ({
        ...prev,
        patientId: "",
        patientName: "",
        patientPhoneNumber: "",
        patientEmail: "",
        age: "",
        gender: "",
        address: "",
      }));
      return;
    }
    setFormValues((prev) => ({
      ...prev,
      patientId: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhoneNumber: patient.phoneNumber,
      patientEmail: patient.email,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
    }));
  };

  // Handle doctor selection
  const handleDoctorSelect = (e) => {
    const selectedDoctor = doctors.find((d) => d._id === e.target.value);
    if (!selectedDoctor) return;
    setFormValues((prev) => ({
      ...prev,
      doctorId: selectedDoctor._id,
      doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
    }));
  };

  // Add medicine to the list
  const handleAddMedicine = (medicine) => {
    setSelectedMedicines((prev) => [
      ...prev,
      {
        medicineId: medicine._id,
        name: medicine.name,
        dose: "1-1-1",
        duration: "",
        whenToTake: "With Food"
      }
    ]);
  };

  // Remove medicine from the list
  const handleRemoveMedicine = (index) => {
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // Update medicine details
  const handleMedicineChange = (index, field, value) => {
    setSelectedMedicines((prev) =>
      prev.map((medicine, i) =>
        i === index ? { ...medicine, [field]: value } : medicine
      )
    );
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Validate required fields
      if (!formValues.hospitalId || !formValues.patientId || !formValues.doctorId) {
        toast.error("Please select Hospital, Patient, and Doctor");
        return;
      }

      // send only the IDs for relations
      formData.append("hospital", formValues.hospitalId);
      formData.append("patient", formValues.patientId);
      formData.append("doctor", formValues.doctorId);

      // append all other invoice-related fields
      Object.entries(formValues).forEach(([key, val]) => {
        if (
          ["hospitalId", "patientId", "doctorId", 
           "patientName", "patientPhoneNumber", "patientEmail"
          ].includes(key)
        ) {
          return;
        }
        formData.append(key, val);
      });

      // Add medicines to form data with proper structure
      selectedMedicines.forEach((medicine, index) => {
        formData.append(`medicines[${index}][medicineId]`, medicine.medicineId);
        formData.append(`medicines[${index}][dose]`, medicine.dose || "1-1-1");
        formData.append(`medicines[${index}][duration]`, medicine.duration || "7");
        formData.append(`medicines[${index}][whenToTake]`, medicine.whenToTake || "With Food");
      });

      const response = await api.post("/invoices", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/${role}/monitor-billing`)
      toast.success("Invoice created successfully!");
      // reset form
      setFormValues({
        hospitalId: "",
        hospitalName: "",
        hospitalAddress: "",
        otherText: "",
        billDate: "",
        billTime: "",
        billNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
        patientId: "",
        patientName: "",
        patientPhoneNumber: "",
        patientEmail: "",
        diseaseName: "",
        doctorName: "",
        description: "",
        amount: "",
        tax: "",
        doctorId: "",
        discount: "",
        totalAmount: "",
        paymentType: "Cash",
        gender: "Male",
        age: "",
        insuranceCompany: "",
        insurancePlan: "",
        claimAmount: "",
        claimedAmount: "",
        status: "Unpaid",
        logoUrl: "",
      });
      setSelectedMedicines([]);
    } catch (err) {
      console.error("Error creating invoice:", err);
      toast.error(err.response?.data?.message || "Error creating invoice. Please try again.");
    }
  };

  // Add custom fields (unchanged)
  const handleAddField = (field, type) => {
    if (type === "hospital") {
      setHospitalFields((prev) => [...prev, field]);
    } else {
      setPatientFields((prev) => [...prev, field]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-6">Create Bill</h1>

        {/* Hospital Details */}
        <h2 className="text-lg font-semibold mb-4">Hospital Details</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={formValues.logoUrl || selectImage}
              alt="Hospital Logo"
              className="w-full h-28 object-cover"
            />
            <span className="mt-2 text-gray-600">Hospital Logo</span>
          </div>

          {/* Hospital Select */}
          <div className="relative mb-6">
            <select
              name="hospitalId"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              value={formValues.hospitalId}
              onChange={handleHospitalSelect}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((hosp) => (
                <option key={hosp._id} value={hosp._id}>
                  {hosp.name}
                </option>
              ))}
            </select>
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Hospital<span className="text-red-500">*</span>
            </label>
          </div>

          {/* Other Text */}
          <div className="relative mb-6">
            <input
              type="text"
              name="otherText"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Other Text"
              value={formValues.otherText}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Other Text
            </label>
          </div>

          {/* Bill Date */}
          <div className="relative mb-6">
            <input
              type="date"
              name="billDate"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              value={formValues.billDate}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Bill Date
            </label>
          </div>

          {/* Bill Time */}
          <div className="relative mb-6">
            <input
              type="time"
              name="billTime"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              value={formValues.billTime}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Bill Time
            </label>
          </div>

          {/* Bill Number */}
          <div className="relative mb-6">
            <input
              type="text"
              name="billNumber"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
              value={formValues.billNumber}
              readOnly
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Bill Number (Auto Generated)
            </label>
          </div>

          {/* Phone */}
          <div className="relative mb-6">
            <input
              type="text"
              name="phoneNumber"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Phone Number"
              value={formValues.phoneNumber}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Phone Number
            </label>
          </div>

          {/* Email */}
          <div className="relative mb-6">
            <input
              type="email"
              name="email"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Email"
              value={formValues.email}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Email
            </label>
          </div>

          {/* Hospital Address */}
          <div className="relative mb-6">
            <input
              type="text"
              name="hospitalAddress"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              value={formValues.hospitalAddress}
              disabled
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Hospital Address
            </label>
          </div>
        </div>

        {/* Patient Details */}
        <h2 className="text-lg font-semibold mt-6 mb-4">Patient Details</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative mb-6 md:col-span-1">
            <Autocomplete
              options={patients}
              getOptionLabel={(p) =>
                `${p.firstName} ${p.lastName} – ${p.phoneNumber}`
              }
              value={selectedPatient}
              onChange={(_, patient) => {
                setSelectedPatient(patient);
                handlePatientSelectByObject(patient);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Type name or phone"
                  className="w-full"
                />
              )}
            />
          </div>

          {/* Disease */}
          <div className="relative mb-6">
            <input
              type="text"
              name="diseaseName"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Disease Name"
              value={formValues.diseaseName}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Disease Name
            </label>
          </div>

          {/* Doctor */}
          <div className="relative mb-6">
            <select
              name="doctorId"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              value={formValues.doctorId}
              onChange={handleDoctorSelect}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.firstName} {doc.lastName}
                </option>
              ))}
            </select>
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Doctor<span className="text-red-500">*</span>
            </label>
          </div>

          {/* Description */}
          <div className="relative mb-6">
            <input
              type="text"
              name="description"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Description"
              value={formValues.description}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Description
            </label>
          </div>

          {/* Amount */}
          <div className="relative mb-6">
            <input
              type="number"
              name="amount"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Amount"
              value={formValues.amount}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Amount
            </label>
          </div>

          {/* Tax */}
          <div className="relative mb-6">
            <input
              type="number"
              name="tax"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Tax (%)"
              value={formValues.tax}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Tax (%)
            </label>
          </div>

          {/* Discount */}
          <div className="relative mb-6">
            <input
              type="number"
              name="discount"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Discount"
              value={formValues.discount}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Discount
            </label>
          </div>

          {/* Total Amount */}
          <div className="relative mb-6">
            <input
              type="text"
              name="totalAmount"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Total Amount"
              value={formValues.totalAmount}
              disabled
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Total Amount
            </label>
          </div>

          {/* Payment Type */}
          <div className="relative mb-6">
            <select
              name="paymentType"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              value={formValues.paymentType}
              onChange={handleInputChange}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="Insurance">Insurance</option>
            </select>
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Payment Type
            </label>
          </div>

          {/* Gender */}
          <div className="relative mb-6">
            <select
              name="gender"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              value={formValues.gender}
              onChange={handleInputChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Gender
            </label>
          </div>

          {/* Age */}
          <div className="relative mb-6">
            <input
              type="text"
              name="age"
              className="peer w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Enter Age"
              value={formValues.age}
              onChange={handleInputChange}
            />
            <label className="absolute left-3 -top-3 px-1 bg-white text-sm text-gray-500">
              Age
            </label>
          </div>
        </div>

        {/* Add Medicine Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Medicines</h2>
          
          {/* Medicine Search */}
          <div className="mb-4">
            <Autocomplete
              options={medicines || []} // Ensure options is always an array
              getOptionLabel={(medicine) => medicine?.name || ''}
              onChange={(_, medicine) => {
                if (medicine) handleAddMedicine(medicine);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Medicine"
                  placeholder="Type medicine name"
                  className="w-full"
                />
              )}
            />
          </div>

          {/* Selected Medicines List */}
          {selectedMedicines.map((medicine, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
              <div className="col-span-1">
                <p className="font-medium">{medicine.name}</p>
              </div>
              
              <div className="col-span-1">
                <select
                  value={medicine.dose}
                  onChange={(e) => handleMedicineChange(index, "dose", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="1-1-1">1-1-1</option>
                  <option value="1-1-0">1-1-0</option>
                  <option value="1-0-1">1-0-1</option>
                  <option value="0-1-1">0-1-1</option>
                  <option value="0-0-1">0-0-1</option>
                  <option value="0-1-0">0-1-0</option>
                  <option value="1-0-0">1-0-0</option>
                </select>
              </div>

              <div className="col-span-1">
                <input
                  type="text"
                  value={medicine.duration}
                  onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                  placeholder="Duration (days)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="col-span-1">
                <select
                  value={medicine.whenToTake}
                  onChange={(e) => handleMedicineChange(index, "whenToTake", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="With Food">With Food</option>
                  <option value="After Food">After Food</option>
                  <option value="Before Food">Before Food</option>
                </select>
              </div>

              <div className="col-span-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-2 mt-6 bg-[#0eabeb] text-white font-semibold rounded-xl"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CreateBill;