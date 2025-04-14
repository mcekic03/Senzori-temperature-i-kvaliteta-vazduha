const { type } = require("express/lib/response");
const db = require("../config/db");
const moment = require('moment-timezone');


class Senzor {
    static async upisPodataka(data) {
        try {
            const { esp8266id, software_version, sensordatavalues } = data;
    
            // Inicijalizuj objekat vrednosti
            const values = {
                PMS_P0: null,
                PMS_P1: null,
                PMS_P2: null,
                BME280_temperature: null,
                BME280_pressure: null,
                BME280_humidity: null,
                samples: null,
                min_micro: null,
                max_micro: null,
                interval: null,
                signal: null
            };
    
            // Popuni vrednosti iz JSON-a
            sensordatavalues.forEach(sensor => {
                if (values.hasOwnProperty(sensor.value_type)) {
                    values[sensor.value_type] = sensor.value;
                }
            });
    
            // SQL upit
            const sql = `
                INSERT INTO senzor (
                    esp8266id, software_version, PMS_P0, PMS_P1, PMS_P2,
                    BME280_temperature, BME280_pressure, BME280_humidity,
                    samples, min_micro, max_micro, \`interval\`, \`signal\`
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
    
            // Parametri za upit

            const pr = (values.BME280_pressure / 100).toFixed(3);

            const params = [
                esp8266id,
                software_version,
                values.PMS_P0,
                values.PMS_P1,
                values.PMS_P2,
                values.BME280_temperature,
                pr,
                values.BME280_humidity,
                values.samples,
                values.min_micro,
                values.max_micro,
                values.interval,
                values.signal
            ];
    
            // Izvrši upit u bazu
            const [result] = await db.promise().query(sql, params);

            if (result.affectedRows > 0) {
                return { message: 'User updated successfully', affectedRows: result.affectedRows };
              } else {
                throw new Error('No user was updated. Please check the user ID.');
              }
            
        } catch (err) {
            console.error("Greška pri upisu podataka:", err);
            throw err; // Ako se desi greška, baci je dalje
        }
    }

    static async poslednjiUnos(id) {
        try {
            // SQL upit za poslednji unos prema timestamp-u
            const sql = `
                SELECT * FROM senzor
                where esp8266id = ?
                ORDER BY timestamp DESC
                LIMIT 1
            `;
            
            // Izvrši upit u bazu
            const [rows] = await db.promise().query(sql, [id]);
                
                const timestampUTC = rows[0].timestamp;
                // Konvertovanje u vremensku zonu (primer: 'Europe/Belgrade' za UTC+2)
                const timestampLocal = moment(timestampUTC).tz('Europe/Belgrade').format('YYYY-MM-DD HH:mm:ss');

                const location1 = "АТВСС Одсек Ниш"
                const location2 = "Самсунг Аппс Лаб"

                const ob = {
                    location: id==='16160069'? location2:location1 ,
                    id: rows[0].esp8266id,
                    timestamp: timestampLocal,
                    pm1: rows[0].PMS_P0,
                    pm25:rows[0].PMS_P1,
                    pm10:rows[0].PMS_P2,
                    temperature: rows[0].BME280_temperature,
                    pressure:  rows[0].BME280_pressure,
                    humidity:rows[0].BME280_humidity
                }

            
  
            
            // Ako postoji unos, vrati ga
            if (rows.length > 0) {
                return ob; // Poslednji unos prema timestamp-u
            } else {
                return null; // Ako nema podataka u tabeli
            }
        } catch (err) {
            console.error("Greška pri dobijanju poslednjeg unosa:", err);
            throw err; // Ako se desi greška, baci je dalje
        }
    }

    static async procenti() {
        try {
            // SQL upit za poslednji unos prema timestamp-u
            const sql = `
                WITH senzA AS (
  SELECT PMS_P1, timestamp, ROW_NUMBER() OVER (ORDER BY timestamp) AS rn
  FROM senzor
  WHERE esp8266id = '16160069' AND timestamp >= NOW() - INTERVAL 1 DAY
),
senzB AS (
  SELECT PMS_P1, timestamp, ROW_NUMBER() OVER (ORDER BY timestamp) AS rn
  FROM senzor
  WHERE esp8266id = '9091332' AND timestamp >= NOW() - INTERVAL 1 DAY
)
SELECT
  senzA.timestamp,
  senzA.PMS_P1 AS temp_senzorA,
  senzB.PMS_P1 AS temp_senzorB
FROM senzA
JOIN senzB ON senzA.rn = senzB.rn
ORDER BY senzA.timestamp ASC;`;
            
            // Izvrši upit u bazu
            const [rows] = await db.promise().query(sql);

           const poruka =  this.compareSensors(rows)
            return poruka;
                
        } catch (err) {
            console.error("Greška pri dobijanju poslednjeg unosa:", err);
            throw err; // Ako se desi greška, baci je dalje
        }
    }

    static compareSensors(data) {
        let totalA = 0; // Ukupna suma za senzor A
        let totalB = 0; // Ukupna suma za senzor B
      
        // Prolazimo kroz sve objekte u nizu i sabiramo temperature za oba senzora
        data.forEach(item => {
          totalA += item.temp_senzorA;
          totalB += item.temp_senzorB;
        });
      
        // Izračunaj koji senzor je imao veću ukupnu temperaturu
        let greaterSensor = '';
        let percentageDifference = 0;
      
        if (totalA > totalB) {
          greaterSensor = 'SamsungAppsLab';
          percentageDifference = ((totalA - totalB) / totalB) * 100;
        } else if (totalB > totalA) {
          greaterSensor = 'ATVSS Odsek Nis';
          percentageDifference = ((totalB - totalA) / totalA) * 100;
        } else {
          greaterSensor = 'Nema razlike';
          percentageDifference = 0;
        }
        

        // Vraćamo poruku u formatu stringa
        return `${greaterSensor} je imao veću zagadjenost za ${percentageDifference.toFixed(2)}% u zadnjih 24h`;
      }
    
}

    

module.exports = Senzor;