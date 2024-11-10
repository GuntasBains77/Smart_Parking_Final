import React, { useState, useEffect } from 'react';
import axios from 'axios';
const NotificationCard = ({ entry }) => {
    return (
      <div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
        <h3>New Entry</h3>
        <p>ID: {entry.uid}</p>
        <p>Name: {entry.name}</p>
        <p>Phone: {entry.phone}</p>
        <p>Entry Time: {new Date(entry.entryTime).toLocaleString()}</p>
      </div>
    );
  };
  

  const EntryNotification = () => {
    // Dummy data for initial testing
    const [entries, setEntries] = useState([
      {
        uid: 'ABC123',
        name: 'John Doe',
        phone: '123-456-7890',
        entryTime: new Date().toISOString(),
      },
      {
        uid: 'XYZ456',
        name: 'Jane Smith',
        phone: '098-765-4321',
        entryTime: new Date().toISOString(),
      },
    ]);
  const [shownEntries, setShownEntries] = useState(new Set()); // Track IDs of entries already shown

useEffect(() => {
    const intervalId = setInterval(fetchEntries, 5000); // Poll every 5 seconds

    async function fetchEntries() {
      try {
        const response = await axios.get('http://localhost:8080/system/entries');
        const newEntries = response.data.filter(entry => !shownEntries.has(entry.uid));

        if (newEntries.length > 0) {
          setEntries(prevEntries => [...newEntries, ...prevEntries]);
          newEntries.forEach(entry => shownEntries.add(entry.uid)); // Mark these entries as shown
          setShownEntries(new Set(shownEntries)); // Update state to trigger rerender
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    }

    fetchEntries(); // Initial fetch on component mount
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [shownEntries]);

  return (
    <div>
      {entries.map(entry => (
        <NotificationCard key={entry.uid} entry={entry} />
      ))}
    </div>
  );
};

export default EntryNotification;
