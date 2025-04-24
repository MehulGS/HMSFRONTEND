import { useEffect, useState } from 'react';
import { Group, LocalHospital, EventAvailable } from '@mui/icons-material';
import InfoCard from '../pages/adminPages/InfoCard';
import api from '../api/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const StatisticsCards = () => {
  const [counts, setCounts] = useState({
    patients: 0,
    doctors: 0,
    receptionist: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [patientsRes, doctorsRes, receptionistRes] = await Promise.all([
          api.get('/users/patients'),
          api.get('/users/doctors'),
          api.get('/users/receptionist'),
        ]);

        const patientsCount = Array.isArray(patientsRes.data) ? patientsRes.data.length : 0;
        const doctorsCount = Array.isArray(doctorsRes.data) ? doctorsRes.data.length : 0;
        const receptionistCount = Array.isArray(receptionistRes.data) ? receptionistRes.data.length : 0;


        setCounts({
          patients: patientsCount,
          doctors: doctorsCount,
          receptionist: receptionistCount,
        });
      } catch (error) {
        console.error('❌ Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 rounded-2xl">
      <InfoCard
        icon={<Group className="text-blue-600" />}
        label="Total Patients"
        value={loading ? <Skeleton width={40} height={25} /> : counts.patients}
        iconBgColor="bg-blue-100"
      />
      <InfoCard
        icon={<LocalHospital className="text-purple-600" />}
        label="Total Doctors"
        value={loading ? <Skeleton width={40} height={25} /> : counts.doctors}
        iconBgColor="bg-purple-100"
      />
      <InfoCard
        icon={<EventAvailable className="text-green-600" />}
        label="Total Receptionist"
        value={loading ? <Skeleton width={40} height={25} /> : counts.receptionist}
        iconBgColor="bg-green-100"
      />
    </div>
  );
};

export default StatisticsCards;
