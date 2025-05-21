import React, { useState, useEffect } from 'react'
import api from '../../../api/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode'

const MedicalCertificateForm = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [diseases, setDiseases] = useState([])
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    doctorName: '',
    diseaseName: '',
    reason: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/users/patients')
        setPatients(response.data || [])
      } catch (error) {
        console.error('Error fetching patients:', error)
        setPatients([])
      }
    }
    fetchPatients()
  }, [])

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/users/doctors')
        setDoctors(response.data || [])
      } catch (error) {
        console.error('Error fetching doctors:', error)
        setDoctors([])
      }
    }
    fetchDoctors()
  }, [])

  // Fetch diseases
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await api.get('/diseases')
        setDiseases(response.data.diseases || [])
      } catch (error) {
        console.error('Error fetching diseases:', error)
        setDiseases([])
      }
    }
    fetchDiseases()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // If patient is selected, update age and gender
    if (name === 'patientName') {
      const selectedPatient = patients.find(p => p._id === value)
      if (selectedPatient) {
        setFormData(prev => ({
          ...prev,
          patientAge: selectedPatient.age || '',
          patientGender: selectedPatient.gender || ''
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.patientName || !formData.patientAge || !formData.patientGender || 
        !formData.doctorName || !formData.diseaseName || !formData.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const selectedPatient = patients.find(p => p._id === formData.patientName)
      const selectedDoctor = doctors.find(d => d._id === formData.doctorName)
      const selectedDisease = diseases.find(d => d._id === formData.diseaseName)

      const certificateData = {
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        diseaseName: selectedDisease.name,
        reason: formData.reason,
        type: "Medical",
        status: "Active"
      }

      const response = await api.post('/certificate', certificateData)
      
      toast.success('Certificate created successfully')
      // Reset form
      setFormData({
        patientName: '',
        patientAge: '',
        patientGender: '',
        doctorName: '',
        diseaseName: '',
        reason: '',
      })
      
      // Get user role from localStorage and navigate
      const token = localStorage.getItem('token')
      const decoded = jwtDecode(token)
      const role = decoded.role
      navigate(`/${role}/medical-certificate`)
      
    } catch (error) {
      console.error('Error creating certificate:', error)
      toast.error(error.response?.data?.message || 'Error creating certificate')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-[#030229]">
              Create Medical Certificate
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name
              </label>
              <select
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
                <option value="">Select Patient</option>
                {patients?.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Age
              </label>
              <input
                type="number"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Gender
              </label>
              <select
                name="patientGender"
                value={formData.patientGender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name
              </label>
              <select
                name="doctorName"
                value={formData.doctorName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
                <option value="">Select Doctor</option>
                {doctors?.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Disease Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disease
              </label>
              <select
                name="diseaseName"
                value={formData.diseaseName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
                <option value="">Select Disease</option>
                {diseases?.map((disease) => (
                  <option key={disease._id} value={disease._id}>
                    {disease.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                rows="4"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors
                  ${isLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isLoading ? 'Creating...' : 'Create Certificate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MedicalCertificateForm