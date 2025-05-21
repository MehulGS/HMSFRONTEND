import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const COMMON_CHARGES = [
  { type: "Dressing", amount: 200 },
  { type: "Injection", amount: 200 },
  { type: "Nebulization", amount: 200 },
  { type: "ECG", amount: 350 },
  { type: "Day Care", amount: 1000 },
  { type: "Emergency ODP", amount: 500 },
  { type: "Other", amount: 0 }
];

const EditBill = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    gender: "",
    age: "",
    doctorName: "",
    diseaseName: "",
    description: "",
    paymentType: "",
    billDate: "",
    billTime: "",
    billNumber: id,
    discount: "",
    amount: "",
    totalAmount: "",
    address: "",
    charges: {
      odpCharges: 0,
      additionalCharges: [],
    },
  });

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const response = await api.get(`/invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const invoiceData = response.data.invoice;
        const odpCharges = invoiceData.amount || 0;
        const additionalCharges = invoiceData.charges?.additionalCharges || [];
        const totalCharges =
          odpCharges +
          additionalCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
        const totalAmount =
          odpCharges +
          totalCharges -
          (invoiceData.discount ? Number(invoiceData.discount) : 0);

        setFormData({
          patient: invoiceData.patient._id,
          doctor: invoiceData.doctor._id,
          patientName: `${invoiceData.patient.firstName} ${invoiceData.patient.lastName}`,
          phoneNumber: invoiceData.patient.phoneNumber,
          gender: invoiceData.patient.gender,
          age: parseInt(invoiceData.patient.age, 10) || "",
          doctorName: `${invoiceData.doctor.firstName} ${invoiceData.doctor.lastName}`,
          diseaseName: invoiceData.diseaseName,
          description: invoiceData.description,
          paymentType: invoiceData.paymentType,
          billDate: new Date(invoiceData.billDate).toISOString().split("T")[0],
          billTime: invoiceData.billTime,
          billNumber: invoiceData.billNumber,
          discount: invoiceData.discount,
          amount: odpCharges,
          totalAmount: totalAmount,
          address: invoiceData.patient.address,
          charges: {
            odpCharges,
            additionalCharges,
          },
        });
      } catch (error) {
        console.error("Error fetching bill data:", error);
      }
    };

    fetchBillData();
  }, [id]);

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
    const calculatedTotal = Number(formData.amount) + totalCharges - (Number(formData.discount) || 0);
    setFormData((prevValues) => ({
      ...prevValues,
      totalAmount: calculatedTotal.toFixed(2),
    }));
  }, [formData.amount, formData.discount, formData.charges.additionalCharges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure additionalCharges is an array
      let additionalCharges = formData.charges.additionalCharges;
      if (!Array.isArray(additionalCharges)) {
        // Convert object with numeric keys to array
        additionalCharges = Object.values(additionalCharges);
      }

      const safeFormData = {
        ...formData,
        charges: {
          ...formData.charges,
          additionalCharges: additionalCharges
        },
      };

      const response = await api.patch(`/invoices/${id}`, safeFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200 && response.data?.data) {
        const updatedInvoice = response.data.data;
        
        // Safely access values with fallbacks
        const odpCharges = Number(updatedInvoice.amount) || 0;
        const additionalCharges = updatedInvoice.charges?.additionalCharges || [];
        const discount = Number(updatedInvoice.discount) || 0;
        
        const totalCharges = odpCharges + 
          additionalCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
        
        const totalAmount = odpCharges + totalCharges - discount;

        toast.success(response.data.message || "Bill updated successfully!");
        navigate(`/${role}/payment-process`);
      } else {
        console.error("Invalid response format:", response);
        toast.error("Failed to update the bill. Invalid response from server.");
      }
    } catch (error) {
      console.error("Error updating bill:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update the bill. Please try again.");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Edit Bill</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border rounded-xl p-4 md:p-6"
      >
        {[
          {
            label: "Patient Name",
            name: "patientName",
            type: "text",
            disabled: true,
          },
          { label: "Phone Number", name: "phoneNumber", type: "text", disabled: true },
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
          { label: "Disease Name", name: "diseaseName", type: "text" },
          { label: "Description", name: "description", type: "text" },
          {
            name: "paymentType",
            type: "select",
            options: ["Cash", "Online"],
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
          { label: "Address", name: "address", type: "text" },
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
                value={formData.amount}
                onChange={e => {
                  const value = Number(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    amount: value,
                    charges: {
                      ...prev.charges,
                      odpCharges: value
                    }
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
          <label className="mb-1 font-medium text-gray-700">Additional Charges</label>
          {formData.charges?.additionalCharges?.map((charge, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 mb-2 items-center">
              {/* Select for common types */}
              <select
                className="px-2 py-1 border border-gray-300 rounded focus:outline-none w-40"
                value={COMMON_CHARGES.some(c => c.type === charge.type) ? charge.type : "Other"}
                onChange={e => {
                  const selected = COMMON_CHARGES.find(c => c.type === e.target.value);
                  const updated = [...formData.charges.additionalCharges];
                  updated[idx].type = selected ? selected.type : "";
                  updated[idx].amount = selected ? selected.amount : 0;
                  setFormData({
                    ...formData,
                    charges: { ...formData.charges, additionalCharges: updated }
                  });
                }}
              >
                {COMMON_CHARGES.map(opt => (
                  <option key={opt.type} value={opt.type}>{opt.type} {opt.amount ? `(${opt.amount})` : ""}</option>
                ))}
              </select>
              {/* If 'Other', allow custom type */}
              {charge.type === "Other" && (
                <input
                  type="text"
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none w-32"
                  placeholder="Custom Type"
                  value={charge.customType || ""}
                  onChange={e => {
                    const updated = [...formData.charges.additionalCharges];
                    updated[idx].customType = e.target.value;
                    setFormData({
                      ...formData,
                      charges: { ...formData.charges, additionalCharges: updated }
                    });
                  }}
                />
              )}
              {/* Amount input, always editable */}
              <input
                type="number"
                className="px-2 py-1 border border-gray-300 rounded focus:outline-none w-24"
                placeholder="Amount"
                value={charge.amount}
                onChange={e => {
                  const updated = [...formData.charges.additionalCharges];
                  updated[idx].amount = Number(e.target.value);
                  setFormData({
                    ...formData,
                    charges: { ...formData.charges, additionalCharges: updated }
                  });
                }}
              />
              <button
                type="button"
                className="text-red-600 font-bold px-2"
                onClick={() => {
                  const updated = formData.charges.additionalCharges.filter((_, i) => i !== idx);
                  setFormData({
                    ...formData,
                    charges: { ...formData.charges, additionalCharges: updated }
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
                    { type: "Dressing", amount: 200 }
                  ]
                }
              })
            }
          >
            + Add Additional Charge
          </button>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-[#0eabeb] text-white rounded-xl "
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBill;
