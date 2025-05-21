import React, { useState, useEffect } from 'react'
import api from '../../../api/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode'

const SickCertificateForm = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [diseases, setDiseases] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDisease, setSelectedDisease] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState('')
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

  // Calculate duration when dates change
  useEffect(() => {
    if (fromDate && endDate) {
      const start = new Date(fromDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setDuration(`${diffDays} days`)
    }
  }, [fromDate, endDate])

  const handlePatientChange = (e) => {
    setSelectedPatient(e.target.value)
  }

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value)
  }

  const handleDiseaseChange = (e) => {
    setSelectedDisease(e.target.value)
  }

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value)
  }

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!selectedPatient || !selectedDoctor || !selectedDisease || !fromDate || !endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const selectedPatientData = patients.find(p => p._id === selectedPatient)
      const selectedDoctorData = doctors.find(d => d._id === selectedDoctor)
      const selectedDiseaseData = diseases.find(d => d._id === selectedDisease)

      const certificateData = {
        patientName: `${selectedPatientData.firstName} ${selectedPatientData.lastName}`,
        doctorName: `Dr. ${selectedDoctorData.firstName} ${selectedDoctorData.lastName}`,
        type: "Sick",
        diseaseName: selectedDiseaseData.name,
        fromDate,
        endDate,
        duration,
        status: "Active"
      }

      const response = await api.post('/certificate', certificateData)
      
      toast.success('Certificate created successfully')
      // Reset form
      setSelectedPatient('')
      setSelectedDoctor('')
      setSelectedDisease('')
      setFromDate('')
      setEndDate('')
      setDuration('')
      
      // Get user role from localStorage and navigate
      const token = localStorage.getItem('token')
      const decoded = jwtDecode(token)
      const role = decoded.role
      navigate(`/${role}/sick-certificate`)
      
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
              Create Sick Certificate
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={selectedPatient}
                onChange={handlePatientChange}
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

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={selectedDoctor}
                onChange={handleDoctorChange}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={selectedDisease}
                onChange={handleDiseaseChange}
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

            {/* Date Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  value={endDate}
                  onChange={handleEndDateChange}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                value={duration}
                disabled
                placeholder="Duration will be calculated automatically"
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

export default SickCertificateForm