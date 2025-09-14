import React, { useEffect, useState } from "react";
import api from "../../../../services/api";

interface Technician {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

const ManageTechnicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await api.get("/repair/technicians");
        setTechnicians(res.data);
      } catch (err) {
        console.error("Failed to fetch technicians", err);
      }
    };
    fetchTechnicians();
  }, []);

  return (
    <div>
      <h2>Technicians</h2>
      {technicians.length === 0 ? (
        <p>No technicians found.</p>
      ) : (
        <ul>
          {technicians.map((t) => (
            <li key={t.userId}>
              {t.firstName} {t.lastName} ({t.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageTechnicians;
