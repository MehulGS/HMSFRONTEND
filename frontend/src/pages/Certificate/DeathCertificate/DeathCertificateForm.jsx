import React, { useState, useEffect } from 'react'
import api from '../../../api/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const DeathCertificateForm = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [diseases, setDiseases] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDisease, setSelectedDisease] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [deathTime, setDeathTime] = useState('')
  const [displayTime, setDisplayTime] = useState('')
  const [deathCause, setDeathCause] = useState('')
  const [deathPlace, setDeathPlace] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState('')
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
        const fetchedDoctors = response.data || []
        setDoctors(fetchedDoctors)

        // Set the latest doctor as default if there are doctors available
        if (fetchedDoctors && fetchedDoctors.length > 0) {
          // Sort doctors by creation date (assuming there's a createdAt field)
          const sortedDoctors = [...fetchedDoctors].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )
          setSelectedDoctor(sortedDoctors[0]._id)
        }
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

  const handlePatientChange = (e) => {
    const patientId = e.target.value
    setSelectedPatient(patientId)
    
    if (patientId) {
      const selectedPatientData = patients.find(p => p._id === patientId)
      if (selectedPatientData && selectedPatientData.dateOfBirth) {
        setBirthDate(selectedPatientData.dateOfBirth)
      }
    } else {
      setBirthDate('')
    }
  }

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value)
  }

  const handleDiseaseChange = (e) => {
    setSelectedDisease(e.target.value)
  }

  const handleBirthDateChange = (e) => {
    setBirthDate(e.target.value)
  }

  const handleDeathDateChange = (e) => {
    setDeathDate(e.target.value)
  }

  const handleDeathTimeChange = (e) => {
    const time24 = e.target.value
    if (time24) {
      // Store the original 24-hour format
      setDeathTime(time24)
      
      // Convert to 12-hour format for display
      const [hours, minutes] = time24.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      const time12 = `${hour12}:${minutes} ${ampm}`
      setDisplayTime(time12)
    } else {
      setDeathTime('')
      setDisplayTime('')
    }
  }

  const handleDeathCauseChange = (e) => {
    setDeathCause(e.target.value)
  }

  const handleDeathPlaceChange = (e) => {
    setDeathPlace(e.target.value)
  }

  const handleGenderChange = (e) => {
    setPatientGender(e.target.value)
  }

  const handleAgeChange = (e) => {
    setPatientAge(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!selectedPatient || !selectedDoctor  || !birthDate || 
        !deathDate || !deathTime || !deathCause || !deathPlace || !patientGender) {
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
        type: "Death",
        diseaseName: selectedDiseaseData.name,
        patientAge: Number(patientAge),
        patientGender,
        deathDate,
        deathTime,
        deathCause,
        deathPlace,
        birthDate,
        status: "Active"
      }

      const response = await api.post('/certificate', certificateData)
      
      toast.success('Death Certificate created successfully')
      // Reset form
      setSelectedPatient('')
      setSelectedDoctor('')
      setSelectedDisease('')
      setBirthDate('')
      setDeathDate('')
      setDeathTime('')
      setDeathCause('')
      setDeathPlace('')
      setPatientAge('')
      setPatientGender('')
      
      // Get user role from localStorage and navigate
      const token = localStorage.getItem('token')
      const decoded = jwtDecode(token)
      const role = decoded.role
      navigate(`/${role}/death-certificate`)
      
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
              Create Death Certificate
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
              >
                <option value="">Select Disease</option>
                {diseases?.map((disease) => (
                  <option key={disease._id} value={disease._id}>
                    {disease.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={patientGender}
                onChange={handleGenderChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={birthDate}
                onChange={handleBirthDateChange}
                required
              />
            </div>

            {/* Age Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={patientAge}
                onChange={handleAgeChange}
                required
                min="0"
                placeholder="Enter patient's age"
              />
            </div>

            {/* Death Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Death
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={deathDate}
                onChange={handleDeathDateChange}
                required
              />
            </div>

            {/* Death Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Death
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={deathTime}
                onChange={handleDeathTimeChange}
                required
              />
              {displayTime && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected time: {displayTime}
                </p>
              )}
            </div>

            {/* Death Cause */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cause of Death
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={deathCause}
                onChange={handleDeathCauseChange}
                required
                rows="3"
                placeholder="Enter the cause of death"
              />
            </div>

            {/* Death Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place of Death
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={deathPlace}
                onChange={handleDeathPlaceChange}
                required
                placeholder="Enter the place of death"
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

export default DeathCertificateForm