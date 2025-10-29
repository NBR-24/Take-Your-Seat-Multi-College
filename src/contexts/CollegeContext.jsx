import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';

const CollegeContext = createContext();

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};

export const CollegeProvider = ({ children }) => {
  const [collegeId, setCollegeId] = useState(null);
  const [collegeData, setCollegeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load college data when collegeId changes
  useEffect(() => {
    const loadCollegeData = async () => {
      if (!collegeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const collegeRef = ref(db, `colleges/${collegeId}`);
        const snapshot = await get(collegeRef);
        
        if (snapshot.exists()) {
          setCollegeData(snapshot.val());
        } else {
          setError('College not found');
          setCollegeData(null);
        }
      } catch (err) {
        console.error('Error loading college data:', err);
        setError(err.message);
        setCollegeData(null);
      } finally {
        setLoading(false);
      }
    };

    loadCollegeData();
  }, [collegeId]);

  const value = {
    collegeId,
    collegeData,
    loading,
    error,
    setCollegeId,
    setCollegeData
  };

  return (
    <CollegeContext.Provider value={value}>
      {children}
    </CollegeContext.Provider>
  );
};
