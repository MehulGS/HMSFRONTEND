import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const COMMON_CHARGES = [
  { type: "Dressing", amount: 200 },
  { type: "Injection", amount: 200 },
  { type: "Nebulization", amount: 200 },
  { type: "ECG", amount: 350 },
  { type: "Day Care", amount: 1000 },
  { type: "Emergency ODP", amount: 500 },
  { type: "Other", amount: 0 },
];

const CreateBill = () => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [hospital] = useState(decoded.adminhospital);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    gender: "",
    age: "",
    doctorName: "",
    doctorId: "",
    diseaseName: "",
    paymentType: "Cash",
    billDate: new Date().toISOString().split("T")[0],
    billTime: new Date().toTimeString().split(" ")[0].slice(0, 5),
    billNumber: "",
    totalAmount: "",
    charges: {
      odpCharges: 0,
      additionalCharges: [],
    },
  });

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get("/users/patients");
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to fetch patients");
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

        // If role is doctor, set the current doctor as selected
        if (role === "doctor") {
          const currentDoctor = response.data.find((d) => d._id === decoded.id);
          if (currentDoctor) {
            setFormData((prev) => ({
              ...prev,
              doctorId: currentDoctor._id,
              doctorName: `${currentDoctor.firstName} ${currentDoctor.lastName}`,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch doctors");
      }
    };

    fetchDoctors();
  }, [role, decoded.id]);

  // Fetch diseases
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await api.get("/diseases");
        setDiseases(response.data.diseases || []);
      } catch (error) {
        console.error("Error fetching diseases:", error);
        toast.error("Failed to fetch diseases");
      }
    };

    fetchDiseases();
  }, []);

  // Fetch last bill number
  useEffect(() => {
    const fetchLastBillNumber = async () => {
      try {
        const response = await api.get("/invoices");
        const bills = response.data.data || [];
        const highestBillNumber = bills.reduce((max, bill) => {
          const currentNumber = parseInt(
            bill.billNumber?.replace(/\D/g, "") || "0"
          );
          return Math.max(max, currentNumber);
        }, 0);

        const newBillNumber = `BILL${(highestBillNumber + 1)
          .toString()
          .padStart(6, "0")}`;
        setFormData((prev) => ({
          ...prev,
          billNumber: newBillNumber,
        }));
      } catch (error) {
        console.error("Error fetching bills:", error);
        const fallbackBillNumber = `BILL${(1).toString().padStart(6, "0")}`;
        setFormData((prev) => ({
          ...prev,
          billNumber: fallbackBillNumber,
        }));
      }
    };

    fetchLastBillNumber();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "age") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    const totalCharges = formData.charges.additionalCharges.reduce(
      (sum, c) => sum + Number(c.amount || 0),
      0
    );
    const calculatedTotal = Number(formData.charges.odpCharges) + totalCharges;
    setFormData((prevValues) => ({
      ...prevValues,
      totalAmount: calculatedTotal.toFixed(2),
    }));
  }, [formData.charges.odpCharges, formData.charges.additionalCharges]);

  const handlePatientSearch = (e) => {
    setPatientSearch(e.target.value);
    setShowPatientDropdown(true);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(patientSearch.toLowerCase()) ||
      patient.phoneNumber.includes(patientSearch)
  );

  const handlePatientSelect = (patient) => {
    setPatientSearch(
      `${patient.firstName} ${patient.lastName} - ${patient.phoneNumber}`
    );
    setShowPatientDropdown(false);
    setSelectedPatientId(patient._id);
    setFormData((prev) => ({
      ...prev,
      patientName: `${patient.firstName} ${patient.lastName}`,
      phoneNumber: patient.phoneNumber,
      gender: patient.gender,
      age: patient.age,
    }));
  };

  const handleDoctorSelect = (e) => {
    const selectedDoctor = doctors.find((d) => d._id === e.target.value);
    if (selectedDoctor) {
      setFormData((prev) => ({
        ...prev,
        doctorId: selectedDoctor._id,
        doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required IDs
    if (!hospital) {
      toast.error("Hospital ID is required");
      return;
    }
    if (!selectedPatientId) {
      toast.error("Patient ID is required");
      return;
    }
    if (role === "doctor" && !decoded.id) {
      toast.error("Doctor ID is required");
      return;
    }
    if (role !== "doctor" && !formData.doctorId) {
      toast.error("Doctor ID is required");
      return;
    }

    try {
      const billData = {
        ...formData,
        hospital: hospital,
        patient: selectedPatientId,
        doctor: role === "doctor" ? decoded.id : formData.doctorId,
        paymentType: formData.paymentType || "Cash",
        amount: formData.charges.odpCharges,
        charges: {
          odpCharges: formData.charges.odpCharges,
          additionalCharges: formData.charges.additionalCharges
        }
      };

      const response = await api.post("/invoices", billData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Bill created successfully!");
      navigate(`/${role}/monitor-billing`);
    } catch (error) {
      console.error("Error creating bill:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create the bill. Please try again.");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Create Bill</h2>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border rounded-xl p-4 md:p-6"
      >
        {/* Patient Selection Dropdown */}
        <div className="relative mb-4">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
              placeholder="Search and select patient"
              value={patientSearch}
              onChange={handlePatientSearch}
              onFocus={() => setShowPatientDropdown(true)}
              required
            />
            {showPatientDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      {patient.firstName} {patient.lastName} -{" "}
                      {patient.phoneNumber}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No patients found
                  </div>
                )}
              </div>
            )}
          </div>
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500">
            Select Patient<span className="text-red-500">*</span>
          </label>
        </div>

        {/* Doctor Selection - Only show dropdown for admin/receptionist */}
        {role !== "doctor" && (
          <div className="relative mb-4">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
              onChange={handleDoctorSelect}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500">
              Select Doctor<span className="text-red-500">*</span>
            </label>
          </div>
        )}

        {/* Disease Selection */}
        <div className="relative mb-4">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
            value={formData.diseaseName}
            onChange={handleInputChange}
            name="diseaseName"
            required
          >
            <option value="">Select Disease</option>
            {diseases.map((disease) => (
              <option key={disease._id} value={disease.name}>
                {disease.name}
              </option>
            ))}
          </select>
          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500">
            Select Disease<span className="text-red-500">*</span>
          </label>
        </div>

        {[
          {
            label: "Patient Name",
            name: "patientName",
            type: "text",
            disabled: true,
          },
          {
            label: "Phone Number",
            name: "phoneNumber",
            type: "text",
            disabled: true,
          },
          {
            label: "Gender",
            name: "gender",
            type: "select",
            options: ["Male", "Female", "Other"],
          },
          { label: "Age", name: "age", type: "number", disabled: true },
          {
            label: "Doctor Name",
            name: "doctorName",
            type: "text",
            disabled: true,
          },
          {
            name: "paymentType",
            type: "select",
            options: ["Cash", "Online","FOC"],
          },
          { label: "Bill Date", name: "billDate", type: "date" },
          { label: "Bill Time", name: "billTime", type: "time" },
          {
            label: "Bill Number",
            name: "billNumber",
            type: "text",
            disabled: true,
          },
          {
            label: "Total Amount",
            name: "totalAmount",
            type: "text",
            disabled: true,
          },
          {
            label: "ODP Charges",
            name: "odpCharges",
            type: "number",
          },
        ].map((field, index) => (
          <div className="relative mb-4" key={index}>
            {field.type === "select" ? (
              <select
                name={field.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
                value={formData[field.name]}
                onChange={handleInputChange}
              >
                {field.options.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.name === "odpCharges" ? (
              <input
                type="number"
                name={field.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
                placeholder={field.label}
                value={formData.charges.odpCharges}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    charges: {
                      ...prev.charges,
                      odpCharges: value,
                    },
                  }));
                }}
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
                placeholder={field.label}
                value={formData[field.name]}
                onChange={handleInputChange}
                disabled={field.disabled}
              />
            )}
            <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500">
              {field.label}
            </label>
          </div>
        ))}

        {/* Additional Charges */}
        <div className="md:col-span-2 lg:col-span-2 flex flex-col mb-4">
          <label className="mb-1 font-medium text-gray-700">
            Additional Charges
          </label>
          {formData.charges?.additionalCharges?.map((charge, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 mb-2 items-center">
              <select
                className="px-2 py-1 border border-gray-300 rounded focus:outline-none w-40"
                value={
                  COMMON_CHARGES.some((c) => c.type === charge.type)
                    ? charge.type
                    : "Other"
                }
                onChange={(e) => {
                  const selected = COMMON_CHARGES.find(
                    (c) => c.type === e.target.value
                  );
                  const updated = [...formData.charges.additionalCharges];
                  updated[idx].type = selected ? selected.type : "";
                  updated[idx].amount = selected ? selected.amount : 0;
                  setFormData({
                    ...formData,
                    charges: {
                      ...formData.charges,
                      additionalCharges: updated,
                    },
                  });
                }}
              >
                {COMMON_CHARGES.map((opt) => (
                  <option key={opt.type} value={opt.type}>
                    {opt.type} {opt.amount ? `(${opt.amount})` : ""}
                  </option>
                ))}
              </select>
              {charge.type === "Other" && (
                <input
                  type="text"
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none w-32"
                  placeholder="Custom Type"
                  value={charge.customType || ""}
                  onChange={(e) => {
                    const updated = [...formData.charges.additionalCharges];
                    updated[idx].customType = e.target.value;
                    setFormData({
                      ...formData,
                      charges: {
                        ...formData.charges,
                        additionalCharges: updated,
                      },
                    });
                  }}
                />
              )}
              <input
                type="number"
                className="px-2 py-1 border border-gray-300 rounded focus:outline-none w-24"
                placeholder="Amount"
                value={charge.amount}
                onChange={(e) => {
                  const updated = [...formData.charges.additionalCharges];
                  updated[idx].amount = Number(e.target.value);
                  setFormData({
                    ...formData,
                    charges: {
                      ...formData.charges,
                      additionalCharges: updated,
                    },
                  });
                }}
              />
              <button
                type="button"
                className="text-red-600 font-bold px-2"
                onClick={() => {
                  const updated = formData.charges.additionalCharges.filter(
                    (_, i) => i !== idx
                  );
                  setFormData({
                    ...formData,
                    charges: {
                      ...formData.charges,
                      additionalCharges: updated,
                    },
                  });
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 w-fit"
            onClick={() =>
              setFormData({
                ...formData,
                charges: {
                  ...formData.charges,
                  additionalCharges: [
                    ...(formData.charges?.additionalCharges || []),
                    { type: "Dressing", amount: 200 },
                  ],
                },
              })
            }
          >
            + Add Additional Charge
          </button>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-[#0eabeb] text-white rounded-xl"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBill;
