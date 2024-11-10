import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExitNotificationCard = ({ exit }) => {
    return (
      <div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
        <h3>Exit Notification</h3>
        <p>ID: {exit.uid}</p>
        <p>Exit Time: {new Date(exit.exitTime).toLocaleString()}</p>
        <p>Charges: ${exit.charges}</p>
      </div>
    );
  };
  
const ExitNotification = () => {
  const [exits, setExits] = useState([
    // Dummy exit data for testing
    {
      uid: 'C',
      name: 'Charlie',
      exitTime: new Date().toISOString(),
      charges: 70
    },
    {
      uid: 'D',
      name: 'Daisy',
      exitTime: new Date().toISOString(),
      charges: 55
    }
  ]);

//   useEffect(() => {
//     const intervalId = setInterval(fetchExits, 5000); // Poll every 5 seconds

//     async function fetchExits() {
//       try {
//         const response = await axios.get('http://localhost:3000/system/entries');
//         const newExits = response.data.filter(entry => entry.exitTime && !exits.some(exit => exit.uid === entry.uid));

//         if (newExits.length > 0) {
//           setExits(prevExits => [...newExits, ...prevExits]);
//         }
//       } catch (error) {
//         console.error('Error fetching exits:', error);
//       }
//     }

//     fetchExits(); // Initial fetch on component mount
//     return () => clearInterval(intervalId); // Cleanup interval on unmount
//   }, [exits]);

  return (
    <div>
      <h2>Exit Notifications</h2>
      {exits.map(exit => (
        <ExitNotificationCard key={exit.uid} exit={exit} />
      ))}
    </div>
  );
};


export default ExitNotification;
