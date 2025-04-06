const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const os = require('os');
const path = require('path');



dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());






// Test ruta
app.get('/', (req, res) => {
  res.send('🚀 Express server je pokrenut!');
});

// Rute

app.use("/users/images", express.static(path.join(__dirname, "public")));

const senzorRoutes = require('./routes/senzori');
app.use('/', senzorRoutes);






// Dobijanje lokalne IP adrese
const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address; // Vraća prvu dostupnu IPv4 adresu
            }
        }
    }
    return '127.0.0.1'; // Ako ne pronađe, vraća localhost
};

// Pokretanje servera
const PORT = process.env.APP_PORT || 2000;
const LOCAL_IP = getLocalIp();

app.listen(PORT, () => {
  console.log(`✅ Server radi na:`);
  console.log(`   🔹 Lokalno:   http://localhost:${PORT}`);
  console.log(`   🔹 Mrežna IP: http://${LOCAL_IP}:${PORT}`);
});
