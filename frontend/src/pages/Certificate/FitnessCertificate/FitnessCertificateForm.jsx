import React, { useState, useEffect } from 'react'
import api from '../../../api/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode'

const FitnessCertificateForm = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientHeight: '',
    patientWeight: '',
    patientGender: '',
    doctorName: '',
    isFit: 'Fit', // Default status changed to 'Fit'
    reason: '', // Renamed from unfitReason
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
        const sortedDoctors = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setDoctors(sortedDoctors || [])
        // Set the latest doctor as default
        if (sortedDoctors.length > 0) {
          setFormData(prev => ({
            ...prev,
            doctorName: sortedDoctors[0]._id
          }))
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
        setDoctors([])
      }
    }
    fetchDoctors()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'isFit') {
      setFormData(prev => ({
        ...prev,
        isFit: value,
        // Clear reason if status changes to fit
        reason: value === 'Fit' ? '' : prev.reason
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // If patient is selected, update gender and age
    if (name === 'patientName') {
      const selectedPatient = patients.find(p => p._id === value)
      if (selectedPatient) {
        setFormData(prev => ({
          ...prev,
          patientGender: selectedPatient.gender || '',
          patientAge: selectedPatient.age || ''
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.patientName || !formData.patientAge || !formData.patientHeight || !formData.patientWeight || 
        !formData.patientGender || !formData.doctorName) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate reason if patient is unfit
    if (formData.isFit === 'Unfit' && !formData.reason) {
      toast.error('Please provide a reason for unfit status')
      return
    }

    setIsLoading(true)
    try {
      const selectedPatient = patients.find(p => p._id === formData.patientName)
      const selectedDoctor = doctors.find(d => d._id === formData.doctorName)

      // Calculate BMI
      const heightInMeters = formData.patientHeight / 100
      const bmi = (formData.patientWeight / (heightInMeters * heightInMeters)).toFixed(1)

      const certificateData = {
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientAge: formData.patientAge,
        patientHeight: formData.patientHeight,
        patientWeight: formData.patientWeight,
        patientGender: formData.patientGender,
        doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        bmi: bmi,
        isFit: formData.isFit,
        reason: formData.isFit === 'Unfit' ? formData.reason : '',
        type: "Fitness",
        status: "Active"
      }

      const response = await api.post('/certificate', certificateData)
      
      toast.success('Fitness Certificate created successfully')
      // Reset form
      setFormData({
        patientName: '',
        patientAge: '',
        patientHeight: '',
        patientWeight: '',
        patientGender: '',
        doctorName: '',
        isFit: 'Fit',
        reason: ''
      })
      
      // Get user role from localStorage and navigate
      const token = localStorage.getItem('token')
      const decoded = jwtDecode(token)
      const role = decoded.role
      navigate(`/${role}/fitness-certificate`)
      
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
              Create Fitness Certificate
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

            {/* Patient Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Height (cm)
              </label>
              <input
                type="number"
                name="patientHeight"
                value={formData.patientHeight}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            {/* Patient Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Weight (kg)
              </label>
              <input
                type="number"
                name="patientWeight"
                value={formData.patientWeight}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-100"
                required
                disabled
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

            {/* Fitness Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Status
              </label>
              <div className="flex items-center space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isFit"
                    value="Fit"
                    checked={formData.isFit === 'Fit'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Fit</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isFit"
                    value="Unfit"
                    checked={formData.isFit === 'Unfit'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Unfit</span>
                </label>
              </div>
            </div>

            {/* Reason - Only show if unfit */}
            {formData.isFit === 'Unfit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  rows="3"
                  placeholder="Please provide the reason..."
                  required
                />
              </div>
            )}

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

export default FitnessCertificateForm