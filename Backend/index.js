const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 8080;
const QRCode = require('qrcode');


mongoose.connect('mongodb://localhost:27017/smart_parking', {
	useNewUrlParser: true,
	useUnifiedTopology: true
  }).then(() => {
	console.log('Connected to MongoDB');
  }).catch((error) => {
	console.error('MongoDB connection error:', error);
  });

  const entrySchema = new mongoose.Schema({
	_id: String,  // ID field
	name: String,
	phone: String,
	entryTime: Date,
	exitTime: Date,
	charges: Number,
	paymentStatus: Boolean
  });

  const Entry = mongoose.model('Entry', entrySchema, 'Entries');

//slots 
let slots = [1,1,1,1];

// Middleware
app.use(cors()); // Allow CORS
app.use(express.json()); // Parse JSON bodies

// In-memory database to store UID data and payment status
// Simulated database
const entries = {}; // Stores entries with details like entry/exit times, charges, etc.
const objectTable = { // Static table of user details
  'd3d4f619': { name: 'Alice', phone: '123-456-7890' },
  'ad4f7421': { name: 'Bob', phone: '098-765-4321' },
  'f337d2d9': { name: 'Charlie', phone: '555-555-5555' },
  '83b939da': { name: 'Daisy', phone: '111-222-3333' },
  'E': { name: 'Eve', phone: '666-777-8888' },
  'F': { name: 'Frank', phone: '999-000-1111' },
  'G': { name: 'Grace', phone: '222-333-4444' },
  'H': { name: 'Hank', phone: '444-555-6666' }
};
// Constants
const MIN_CHARGE = 50; // Minimum charge for entry


// Endpoint to register an entry
let NewEntryId = "AD4F7421";
app.post('/system/registerId', (req, res) => {

	const { uid } = req.body;
	//const { uid } = objectTable[uid];

	console.log('Register request',uid);
	if (!uid || !objectTable[uid]) {
	  return res.status(400).json({ message: 'Invalid ID or ID not found in object table.' });
	}
	// if(entries[uid]){
	// 	console.log('Already registered');
	// 	return res.status(200).json({ message: 'Already registered'});
	// }
	const entryTime = new Date();
	entries[uid] = {
	  name: objectTable[uid].name,
	  phone: objectTable[uid].phone,
	  entryTime,
	  exitTime: null,
	  charges: MIN_CHARGE,
	  paymentStatus: false
	};

	NewEntryId = uid;
  
	console.log(`ID ${uid} registered for entry at ${entryTime.toISOString()}`);
	res.status(200).json({ message: 'Entry registered successfully', entryTime });
});

// app.post('/system/registerId', (req, res) => {

// 	//const { uid } = req.body;
// 	const { uid } = objectTable[uid];
	

// 	console.log('Register request',uid);
// 	if (!uid || !objectTable[uid]) {
// 	  return res.status(400).json({ message: 'Invalid ID or ID not found in object table.' });
// 	}
// 	// if(entries[uid]){
// 	// 	console.log('Already registered');
// 	// 	return res.status(200).json({ message: 'Already registered'});
// 	// }
// 	const entryTime = new Date();
// 	entries[uid] = {
// 	  name: objectTable[uid].name,
// 	  phone: objectTable[uid].phone,
// 	  entryTime,
// 	  exitTime: null,
// 	  charges: MIN_CHARGE,
// 	  paymentStatus: false
// 	};
  
// 	console.log(`ID ${uid} registered for entry at ${entryTime.toISOString()}`);
// 	res.status(200).json({ message: 'Entry registered successfully', entryTime });
// });



// app.get('/system/entries', (req, res) => {
// 	const entriesList = Object.entries(entries).map(([uid, entry]) => ({ uid, ...entry }));
// 	res.status(200).json(entriesList);
//   });
let NewExitId = undefined;
app.get('/system/notification', async (req, res) => {
    // Fetch the entry only if NewEntryId is defined
    if (NewEntryId) {
        const entry = await Entry.findOne({ id: NewEntryId });

        console.log({entry});  // Log the fetched entry

        // After fetching the entry, set NewEntryId to undefined
        NewEntryId = undefined;

        return res.status(200).json({entry});
    } else if (NewExitId) {
		try {
            // Generate the QR code for the exit
            const qrData = `http://192.168.1.17:4000/payment`;
            const qrCodeDataURL = await QRCode.toDataURL(qrData);
			const timeDifferenceInHours = (entries[NewExitId].exitTime -entries[NewExitId].entryTime) / (1000 * 60 ); // Convert milliseconds to hours
	
	        // Calculate charges: max(MinCharge, hours * 5)
	        const charges = Math.max(MIN_CHARGE, Math.floor(timeDifferenceInHours) * 5);
	
	        // Update charges in the entries object
	        // entries[uid].exitTime = exitTime;
	        // entries[uid].charges = charges;
            NewExitId = undefined;
            return res.status(200).json({exit: {charges:charges, duration:timeDifferenceInHours, qrCode: qrCodeDataURL} });
        } catch (err) {
            console.error('Error generating QR code:', err);
            return res.status(500).json({ message: 'Error generating QR code' });
        }

	}
	else {
	
        // If NewEntryId is undefined, return null or a message
        return res.status(200).json(null);  // Or return a custom message like: { message: "No more entries to fetch." }
    }

//console.log(JSON.stringify(allEntries[allEntries.length - 1]));

	// const entriesList = Object.keys(allEntries).map(uid => {
	//   const entry = entries[uid] || {};
	//   return {
	// 	uid,
	// 	name: objectTable[uid].name,
	// 	phone: objectTable[uid].phone,
	// 	entryTime: entry.entryTime || null,
	// 	exitTime: entry.exitTime || null,
	// 	charges: entry.charges || MIN_CHARGE,
	// 	paymentStatus: entry.paymentStatus || false
	//   };
	// });
  
	// res.status(200).json(entriesList);
  });
  

// Endpoint to check exit (for example, to open the exit barrier)

app.get('/system/exitId/:uid', (req, res) => {
	const { uid } = req.params;
	console.log('exit request',uid);


	// Check if the entry exists for the UID
	if (!entries[uid] || !entries[uid].entryTime) {
	  return res.status(400).json({ message: 'No active entry found for this ID.' });
	}
	NewExitId = uid;
  
	// Calculate the time difference between entry and exit
	const entryTime = new Date(entries[uid].entryTime);
	const exitTime = new Date();
	const timeDifferenceInHours = (exitTime - entryTime) / (1000 * 60 * 60); // Convert milliseconds to hours
	
	// Calculate charges: max(MinCharge, hours * 5)
	const charges = Math.max(MIN_CHARGE, Math.floor(timeDifferenceInHours) * 5);
	
	// Update charges in the entries object
	entries[uid].exitTime = exitTime;
	entries[uid].charges = charges;
  
	console.log(`ID ${uid} exit requested at ${exitTime.toISOString()}`);
	console.log(`Charges for ID ${uid}: ${charges}`);
  
	// Send the response with the updated exit time and charges
	res.status(200).json({
	  message: 'Exit ID verified',
	  charges: charges
	});
});
  
// Endpoint to verify payment
app.get('/system/verifyPayment/:uid', (req, res) => {
	console.log('verify payment request');
	const { uid } = req.params;
  
	if (!entries[uid]) {
	  return res.status(400).json({ message: 'ID not found or no entry registered.' });
	}
	if (entries[uid].paymentStatus) {
		console.log(`Payment verified for UID: ${uid}`);
		res.status(200).send({ message: 'Payment verified' });
	} else {
		console.log(`Payment not verified for UID: ${uid}`);
		res.status(404).send({ message: 'Payment not verified' });
	}
});


app.get('/payment/:uid',(req, res) => {
	const uid = req.params.uid;
	// if(entries[uid].paymentStatus === true){
	// 	console.log(`Payment already done for: ${uid}`);
	// 	res.json({message: `Payment already done for: ${uid}`});
	// 	return ;	
	// }
	// entries[uid].paymentStatus=true;
	console.log(`Payment successful for: ${uid}`);
	res.json({message: `Payment successful for: ${uid}`});
})

app.get('user/bookSlot',(req, res) => {
	for(i=3;i>=0;i--){
		if(slots[i]===1){
			slots[i]=2;
			break;
		}
	}
	return res.json({message:'Slot booked successfully'});
})

// Route to update block status
app.post('/system/updateBlocks', (req, res) => {
	console.log('updateBlocks request');
  const data = req.body.data;
  
  // Check if the data is provided
  if (!data) {
    return res.status(400).send('Data is required');
  }

  console.log(`Received update data: ${data}`);

  // Ensure data is in the expected format (4 slots)
  if (data.length !== 4) {
    return res.status(400).send('Invalid data format. Must represent 4 slots.');
  }

  // Update the slots array based on received data
  for (let i = 0; i < data.length; i++) {
    // Convert the character at each position into an integer and update the slots array
    slots[i] = parseInt(data.charAt(i));
  }

  console.log('Updated slots:', slots);

  // Convert the updated slots array back into a string
  const updatedData = slots.map(slot => slot.toString()).join('');

  // Send updated data back as response in the required format
  res.status(200).send(updatedData); // Response will be a string like "0210"
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
