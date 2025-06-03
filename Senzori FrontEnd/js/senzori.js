// API URL za dobijanje podataka sa servera
const API_URL = 'http://160.99.40.222:3500/GetSenzorData';

// Granice za određivanje nivoa zagađenja prema međunarodnim standardima
const PM1_LIMITS = {
  dobro: 8, // Dobro - do 8 µg/m³
  umereno: 25, // Umereno - do 25 µg/m³
  nezdravo_oset: 40, // Nezdravo za osetljive grupe - do 40 µg/m³
  nezdravo: 100, // Nezdravo - do 100 µg/m³
};

const PM25_LIMITS = {
  dobro: 12, // Dobro - do 12 µg/m³
  umereno: 35.4, // Umereno - do 35.4 µg/m³
  nezdravo_oset: 55.4, // Nezdravo za osetljive grupe - do 55.4 µg/m³
  nezdravo: 150.4, // Nezdravo - do 150.4 µg/m³
};

const PM10_LIMITS = {
  dobro: 54, // Dobro - do 54 µg/m³
  umereno: 154, // Umereno - do 154 µg/m³
  nezdravo_oset: 254, // Nezdravo za osetljive grupe - do 254 µg/m³
  nezdravo: 354, // Nezdravo - do 354 µg/m³
};

// Definisanje adresa lokacija ako nisu dostupne u podacima sa servera
const DEFAULT_ADDRESSES = {
  'Одсек Ниш': 'Александра Медведева 20, Ниш',
  'Одсек Пирот': 'Ћирила и Методија 29, Пирот',
  'Одсек Врање': 'Филипа Филиповића 20, Врање',
  Default: 'Локација није позната',
};

// Granice za određivanje nivoa temperature
const TEMPERATURE_LIMITS = {
  veoma_hladno: 0, // Ispod 0°C - veoma hladno
  hladno: 10, // 0-10°C - hladno
  prijatno: 25, // 10-25°C - prijatno
  toplo: 30, // 25-30°C - toplo
  vruce: 35, // 30-35°C - vruce
  // Preko 35°C - veoma vruce
};

// Granice za određivanje nivoa pritiska
const PRESSURE_LIMITS = {
  veoma_nizak: 980, // Ispod 980 hPa - veoma nizak
  nizak: 1000, // 980-1000 hPa - nizak
  normalan: 1020, // 1000-1020 hPa - normalan
  povisen: 1040, // 1020-1040 hPa - povisen
  // Preko 1040 hPa - visok
};

// Granice za određivanje nivoa vlažnosti vazduha
const HUMIDITY_LIMITS = {
  suvo: 30, // Ispod 30% - suvo
  prijatno: 60, // 30-60% - prijatno
  vlazno: 80, // 60-80% - vlažno
  // Preko 80% - veoma vlažno
};

// Funkcija za inicijalizaciju kartica i dodavanje ID-jeva
function initializeCards() {
  // Pronalaženje svih kartica
  const cardElements = document.querySelectorAll('.card');

  // Dodavanje ID-jeva karticama ako ih nemaju
  cardElements.forEach((card, index) => {
    if (!card.id) {
      card.id = `card${index + 1}`;
    }
  });
}

// Funkcija za određivanje nivoa zagađenja PM1 čestica
function getPM1Level(value) {
  if (value <= PM1_LIMITS.dobro) return 'Добро';
  if (value <= PM1_LIMITS.umereno) return 'Умерено';
  if (value <= PM1_LIMITS.nezdravo_oset) return 'Неповољно';
  if (value <= PM1_LIMITS.nezdravo) return 'Неповољно';
  return 'Опасно';
}

// Funkcija za određivanje nivoa zagađenja PM2.5 čestica
function getPM25Level(value) {
  if (value <= PM25_LIMITS.dobro) return 'Добро';
  if (value <= PM25_LIMITS.umereno) return 'Умерено';
  if (value <= PM25_LIMITS.nezdravo_oset) return 'Неповољно';
  if (value <= PM25_LIMITS.nezdravo) return 'Неповољно';
  return 'Опасно';
}

// Funkcija za određivanje nivoa zagađenja PM10 čestica
function getPM10Level(value) {
  if (value <= PM10_LIMITS.dobro) return 'Добро';
  if (value <= PM10_LIMITS.umereno) return 'Умерено';
  if (value <= PM10_LIMITS.nezdravo_oset) return 'Неповољно';
  if (value <= PM10_LIMITS.nezdravo) return 'Неповољно';
  return 'Опасно';
}

// Funkcija koja određuje najvećeg zagađivača
function getMainPollutant(data) {
  // Normalizacija vrednosti u odnosu na granice
  const normalizedPM1 = data.pm1 / PM1_LIMITS.dobro;
  const normalizedPM25 = data.pm25 / PM25_LIMITS.dobro;
  const normalizedPM10 = data.pm10 / PM10_LIMITS.dobro;

  // Pronalaženje najvećeg normalizovanog zagađivača
  const pollutants = [
    { name: 'ПМ1', value: normalizedPM1, actual: data.pm1 },
    { name: 'ПМ2.5', value: normalizedPM25, actual: data.pm25 },
    { name: 'ПМ10', value: normalizedPM10, actual: data.pm10 },
  ];

  // Sortiranje zagađivača prema normalizovanoj vrednosti
  pollutants.sort((a, b) => b.value - a.value);

  // Vraćanje najvećeg zagađivača
  return {
    name: pollutants[0].name,
    value: `${pollutants[0].actual.toFixed(1)} µg/m³`,
  };
}

// Funkcija za izračunavanje indeksa kvaliteta vazduha (AQI) na osnovu PM2.5 vrednosti
function calculateAQI(pm25) {
  // Pretvaranje u broj za svaki slučaj
  pm25 = parseFloat(pm25);

  // Granice i formule za izračunavanje AQI prema standardnoj metodologiji
  if (pm25 <= 12.0) {
    return Math.round(((50 - 0) / (12.0 - 0.0)) * (pm25 - 0.0) + 0);
  } else if (pm25 <= 35.4) {
    return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  } else if (pm25 <= 55.4) {
    return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  } else if (pm25 <= 150.4) {
    return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  } else if (pm25 <= 250.4) {
    return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  } else if (pm25 <= 350.4) {
    return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
  } else if (pm25 <= 500.4) {
    return Math.round(((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401);
  } else {
    return 500; // Maksimalna vrednost AQI za ekstremno visoke nivoe PM2.5
  }
}

// Funkcija koja određuje boju ikonice za temperaturu
function getTemperatureColor(temperature) {
  temperature = parseFloat(temperature);

  if (temperature <= TEMPERATURE_LIMITS.veoma_hladno) {
    return '#0077ff'; // plava - veoma hladno
  } else if (temperature <= TEMPERATURE_LIMITS.hladno) {
    return '#00a8ff'; // svetlo plava - hladno
  } else if (temperature <= TEMPERATURE_LIMITS.prijatno) {
    return '#00aa00'; // zelena - prijatno
  } else if (temperature <= TEMPERATURE_LIMITS.toplo) {
    return '#ff8c00'; // narandžasta - toplo
  } else if (temperature <= TEMPERATURE_LIMITS.vruce) {
    return '#ff4500'; // crvenkasto-narandžasta - vruce
  } else {
    return '#ff0000'; // crvena - veoma vruce
  }
}

// Funkcija koja određuje boju ikonice za pritisak
function getPressureColor(pressure) {
  pressure = parseFloat(pressure);

  if (pressure <= PRESSURE_LIMITS.veoma_nizak) {
    return '#9966ff'; // ljubičasta - veoma nizak pritisak
  } else if (pressure <= PRESSURE_LIMITS.nizak) {
    return '#669fff'; // plava - nizak pritisak
  } else if (pressure <= PRESSURE_LIMITS.normalan) {
    return '#00aa00'; // zelena - normalan pritisak
  } else if (pressure <= PRESSURE_LIMITS.povisen) {
    return '#ff9900'; // narandžasta - povišen pritisak
  } else {
    return '#ff3300'; // crvena - visok pritisak
  }
}

// Funkcija koja određuje boju ikonice za vlažnost vazduha
function getHumidityColor(humidity) {
  humidity = parseFloat(humidity);

  if (humidity <= HUMIDITY_LIMITS.suvo) {
    return '#ff9900'; // narandžasta - suv vazduh
  } else if (humidity <= HUMIDITY_LIMITS.prijatno) {
    return '#00aa00'; // zelena - prijatna vlažnost
  } else if (humidity <= HUMIDITY_LIMITS.vlazno) {
    return '#00aaff'; // svetlo plava - vlažno
  } else {
    return '#0066ff'; // tamno plava - veoma vlažno
  }
}

// Funkcija za ažuriranje podataka jedne kartice
function updateCardData(cardId, data) {
  const card = document.getElementById(cardId);
  if (!card) return;

  // Provera da li su PM vrednosti definisane
  const pmValues = {
    pm1: data.pm1 !== undefined ? parseFloat(data.pm1) : null,
    pm25: data.pm25 !== undefined ? parseFloat(data.pm25) : null,
    pm10: data.pm10 !== undefined ? parseFloat(data.pm10) : null,
  };

  // Preskakanje ažuriranja ako nijedna PM vrednost nije dostupna
  if (
    pmValues.pm1 === null &&
    pmValues.pm25 === null &&
    pmValues.pm10 === null
  ) {
    console.error('Nema dostupnih PM vrednosti za karticu', cardId);
    return;
  }

  // Određivanje glavnog zagađivača
  const mainPollutant = getMainPollutant(data);

  // Izračunavanje indeksa kvaliteta vazduha (AQI) na osnovu PM2.5 vrednosti
  // koristeći standardnu metodologiju umesto pojednostavljene formule
  const aqiValue = calculateAQI(pmValues.pm25);
  let aqiStatus = getPM25Level(pmValues.pm25);

  // Ažuriranje zaglavlja (lokacija i adresa)
  const locationElement = card.querySelector('.header h1');
  if (locationElement && data.location) {
    locationElement.textContent = data.location;
  }

  const addressElement = card.querySelector('.header p');
  if (addressElement) {
    // Koristi adresu iz podataka ako postoji, inače koristi podrazumevanu adresu za tu lokaciju
    let address = '';

    if (data.address) {
      // Koristi adresu direktno iz podataka ako postoji
      address = data.address;
    } else if (data.location && DEFAULT_ADDRESSES[data.location]) {
      // Koristi podrazumevanu adresu za ovu lokaciju
      address = DEFAULT_ADDRESSES[data.location];
    } else {
      // Koristi podrazumevanu adresu ako ništa drugo nije dostupno
      address = DEFAULT_ADDRESSES['Default'];
    }

    addressElement.textContent = address;
  }

  // Ažuriranje AQI indeksa i statusa
  const indexElement = card.querySelector('.index');
  if (indexElement) {
    indexElement[0].textContent = aqiValue;
    indexElement[1].textContent = '';
  }

  const statusElement = card.querySelector('.status');
  if (statusElement) {
    statusElement.textContent = aqiStatus;
  }

  // Ažuriranje podataka o zagađivaču
  const detailsElements = card.querySelectorAll('.details div');
  if (detailsElements.length >= 2) {
    detailsElements[0].innerHTML = `Главни загађивач: <span class="main-pollutant">${mainPollutant.name}</span>`;
    detailsElements[1].textContent = mainPollutant.value;
  }

  // Ažuriranje podataka u futerima - temperatura sa obojenom ikonicom
  const tempElement = card.querySelector('.temp');
  if (tempElement && data.temperature !== undefined) {
    const tempColor = getTemperatureColor(data.temperature);
    tempElement.innerHTML = `<i class="fa-solid fa-temperature-half" style="color: ${tempColor};"></i> ${parseFloat(
      data.temperature
    ).toFixed(1)}°C`;
  }

  // Ažuriranje podataka u futerima - pritisak sa obojenom ikonicom
  const pressureElement = card.querySelector('.pressure');
  if (pressureElement && data.pressure !== undefined) {
    const pressureColor = getPressureColor(data.pressure);
    pressureElement.innerHTML = `<i class="fa-solid fa-cloud" style="color: ${pressureColor};"></i> ${parseFloat(
      data.pressure
    ).toFixed(1)} hpa`;
  }

  // Ažuriranje podataka u futerima - vlažnost sa obojenom ikonicom
  const humidityElement = card.querySelector('.humidity');
  if (humidityElement && data.humidity !== undefined) {
    const humidityColor = getHumidityColor(data.humidity);
    humidityElement.innerHTML = `<i class="fa-solid fa-droplet" style="color: ${humidityColor};"></i> ${parseFloat(
      data.humidity
    ).toFixed(1)}%`;
  }

  // Ažuriranje vremena poslednjeg ažuriranja
  const timestampElement = card.querySelector('.timestamp');
  if (timestampElement && data.timestamp) {
    // Formatiranje datuma i vremena iz timestamp-a
    try {
      const timestamp = new Date(data.timestamp);
      if (!isNaN(timestamp.getTime())) {
        const day = String(timestamp.getDate()).padStart(2, '0');
        const month = String(timestamp.getMonth() + 1).padStart(2, '0');
        const year = timestamp.getFullYear();
        const hours = String(timestamp.getHours()).padStart(2, '0');
        const minutes = String(timestamp.getMinutes()).padStart(2, '0');

        timestampElement.textContent = `Последње ажурирање: ${day}.${month}.${year} ${hours}:${minutes}`;
      } else {
        timestampElement.textContent = `Последње ажурирање: ${data.timestamp}`;
      }
    } catch (error) {
      console.error('Greška pri formatiranju datuma:', error);
      timestampElement.textContent = `Последње ажурирање: ${data.timestamp}`;
    }
  } else if (timestampElement) {
    // Ako nije dostupan timestamp sa servera, prikazujemo trenutno vreme
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    timestampElement.textContent = `Последње ажурирање: ${day}.${month}.${year} ${hours}:${minutes}`;
  }

  // Ažuriranje ikone i boja
  updateSmileyIcon(cardId, aqiValue);
  updateCardColors(cardId, aqiValue);
}

// Funkcija za ažuriranje ikone smiley-a prema AQI vrednosti
function updateSmileyIcon(cardId, aqiValue) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const smileyElement = card.querySelector('.smiley i');
  if (!smileyElement) return;

  // Određivanje ikone na osnovu AQI vrednosti
  let iconClass = 'fa-face-smile';

  if (aqiValue > 150) {
    iconClass = 'fa-face-dizzy';
  } else if (aqiValue > 100) {
    iconClass = 'fa-face-frown';
  } else if (aqiValue > 50) {
    iconClass = 'fa-face-meh';
  }

  // Uklanjanje svih postojećih klasa ikona
  smileyElement.className = '';

  // Dodavanje nove klase ikone
  smileyElement.classList.add('fa-solid', iconClass);

  // Boja ikonice se postavlja u updateCardColors funkciji
}

// Funkcija koja određuje odgovarajuću boju pozadine na osnovu AQI vrednosti
function updateCardColors(cardId, aqiValue) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const contentElement = card.querySelector('.content');
  const detailsElement = card.querySelector('.details');
  const smileyElement = card.querySelector('.smiley');
  const smileyIconElement = card.querySelector('.smiley i');
  const indexElement = card.querySelector('.index');

  let backgroundColor, borderColor, indexColor, smileyColor;

  if (aqiValue <= 50) {
    backgroundColor = '#a6e06c'; // zelena - dobro
    borderColor = '#83b04d';
    indexColor = '#8cc055';
    smileyColor = '#63902d'; // Tamnija nijansa zelene
  } else if (aqiValue <= 100) {
    backgroundColor = '#ffde2d'; // žuta - umereno
    borderColor = '#e6c800';
    indexColor = '#e6c800';
    smileyColor = '#b69e00'; // Tamnija nijansa žute
  } else if (aqiValue <= 150) {
    backgroundColor = '#ff9835'; // narandžasta - nezdrava za osetljive grupe
    borderColor = '#e67300';
    indexColor = '#e67300';
    smileyColor = '#b65800'; // Tamnija nijansa narandžaste
  } else if (aqiValue <= 200) {
    backgroundColor = '#ff5757'; // crvena - nezdrava
    borderColor = '#e60000';
    indexColor = '#e60000';
    smileyColor = '#b60000'; // Tamnija nijansa crvene
  } else {
    backgroundColor = '#a070b6'; // ljubičasta - veoma nezdrava
    borderColor = '#732673';
    indexColor = '#732673';
    smileyColor = '#521952'; // Tamnija nijansa ljubičaste
  }

  if (contentElement) contentElement.style.backgroundColor = backgroundColor;
  if (detailsElement) detailsElement.style.backgroundColor = backgroundColor;

  // Ažuriranje boje smiley ikonice i okvira prema stanju kvaliteta vazduha
  if (smileyElement) smileyElement.style.borderColor = borderColor;
  if (smileyIconElement) smileyIconElement.style.color = smileyColor;

  if (indexElement) indexElement.style.backgroundColor = indexColor;
}

// Funkcija za preuzimanje podataka sa servera i ažuriranje kartica
async function fetchDataAndUpdateCards() {
  try {
    console.log('Preuzimanje podataka sa servera...');
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP greška! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Podaci primljeni sa servera:', data);

    if (!Array.isArray(data)) {
      console.error('Primljeni podaci nisu niz:', data);
      return;
    }

    if (data.length < 4) {
      console.error('Nedovoljno podataka za sve kartice');
      return;
    }

    // Uzimamo podatke sa indeksa 1, 0 i 3 (Niš, Pirot, Vranje)
    const cardData = [data[1], data[0], data[3]];

    // Hardkodiranje lokacija za sve tri kartice u istom redosledu
    const hardcodedLocations = [
      { location: 'Одсек Ниш', address: 'Александра Медведева 20, Ниш' },
      { location: 'Одсек Пирот', address: 'Ћирила и Методија 29, Пирот' },
      { location: 'Одсек Врање', address: 'Филипа Филиповића 20, Врање' },
    ];

    // Ispisujemo vrednosti PM čestica u konzolu za proveru
    cardData.forEach((sensorData, index) => {
      console.log(
        `Kartica ${index + 1} - PM1: ${sensorData.pm1}, PM2.5: ${
          sensorData.pm25
        }, PM10: ${sensorData.pm10}`
      );

      // Dodajemo fiksne lokacije i adrese bez obzira na podatke sa servera
      sensorData.location = hardcodedLocations[index].location;
      sensorData.address = hardcodedLocations[index].address;
    });

    // Ažuriranje svake kartice odgovarajućim podacima
    cardData.forEach((sensorData, index) => {
      const cardId = `card${index + 1}`;
      updateCardData(cardId, sensorData);
    });

    console.log(
      'Kartice su uspešno ažurirane sa podacima uključujući adrese i PM vrednosti'
    );
  } catch (error) {
    console.error('Greška prilikom preuzimanja podataka:', error);
  }
}

// Inicijalizacija pri učitavanju stranice
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM je učitan, inicijalizacija kartica...');

  // Inicijalizacija kartica
  initializeCards();

  // Prvo preuzimanje i ažuriranje
  await fetchDataAndUpdateCards();

  // Postavljanje intervala za redovno ažuriranje (na 3 minuta)
  setInterval(fetchDataAndUpdateCards, 180000);
  console.log('Postavljeno redovno ažuriranje svakih 3 minuta');
});
