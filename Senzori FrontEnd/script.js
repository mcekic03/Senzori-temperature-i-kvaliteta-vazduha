const API_URL = 'http://160.99.40.222:3500/GetSenzorData';

// Конфигурација метрика
const metrics = [
    { id: 'pm1', name: 'ПМ1', unit: 'μg/m³', icon: 'fa-smile' },
    { id: 'pm25', name: 'ПМ2.5', unit: 'μg/m³', icon: 'fa-smile' },
    { id: 'pm10', name: 'ПМ10', unit: 'μg/m³', icon: 'fa-smile' },
    { id: 'temperature', name: 'Температура', unit: '°C', icon: 'fa-temperature-half' },
    { id: 'pressure', name: 'Притисак', unit: 'hPa', icon: 'fa-compress-arrows-alt' },
    { id: 'humidity', name: 'Влажност', unit: '%', icon: 'fa-tint' }
];

// Функција за форматирање времена
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('sr-RS', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Функције за одређивање нивоа опасности за PM честице
function getPM25DangerLevel(value) {
    if (value <= 12) return { level: 'low', text: 'Добро', icon: 'fa-smile' };
    if (value <= 35.4) return { level: 'moderate', text: 'Умерено', icon: 'fa-meh' };
    if (value <= 55.4) return { level: 'unhealthy', text: 'Неповољно за осетљиве групе', icon: 'fa-frown' };
    if (value <= 150.4) return { level: 'very-unhealthy', text: 'Неповољно', icon: 'fa-dizzy' };
    return { level: 'hazardous', text: 'Опасно', icon: 'fa-skull' };
}

function getPM10DangerLevel(value) {
    if (value <= 54) return { level: 'low', text: 'Добро', icon: 'fa-smile' };
    if (value <= 154) return { level: 'moderate', text: 'Умерено', icon: 'fa-meh' };
    if (value <= 254) return { level: 'unhealthy', text: 'Неповољно за осетљиве групе', icon: 'fa-frown' };
    if (value <= 354) return { level: 'very-unhealthy', text: 'Неповољно', icon: 'fa-dizzy' };
    return { level: 'hazardous', text: 'Опасно', icon: 'fa-skull' };
}

function getPM1DangerLevel(value) {
    if (value <= 8) return { level: 'low', text: 'Добро', icon: 'fa-smile' };
    if (value <= 25) return { level: 'moderate', text: 'Умерено', icon: 'fa-meh' };
    if (value <= 40) return { level: 'unhealthy', text: 'Неповољно за осетљиве групе', icon: 'fa-frown' };
    if (value <= 100) return { level: 'very-unhealthy', text: 'Неповољно', icon: 'fa-dizzy' };
    return { level: 'hazardous', text: 'Опасно', icon: 'fa-skull' };
}

// Функције за одређивање нивоа опасности за температуру, притисак и влажност
function getTemperatureDangerLevel(value) {
    if (value < 5) return { level: 'dangerous', text: 'Веома хладно', icon: 'fa-snowflake' };
    if (value < 10) return { level: 'moderate', text: 'Хладно', icon: 'fa-temperature-low' };
    if (value < 20) return { level: 'low', text: 'Умерено', icon: 'fa-temperature-half' };
    if (value < 30) return { level: 'moderate', text: 'Топло', icon: 'fa-temperature-high' };
    return { level: 'dangerous', text: 'Опасно вруће', icon: 'fa-fire' };
}

function getPressureDangerLevel(value) {
    const deviation = Math.abs(value - 1013.25);
    if (deviation < 10) return { level: 'low', text: 'Нормалан', icon: 'fa-compress-arrows-alt' };
    if (deviation < 20) return { level: 'moderate', text: value > 1013.25 ? 'Повишен' : 'Снижен', icon: 'fa-arrows-alt-v' };
    return { level: value > 1013.25 ? 'pressure-high' : 'pressure-low', 
             text: value > 1013.25 ? 'Знатно повишен' : 'Знатно снижен',
             icon: 'fa-exclamation-triangle' };
}

function getHumidityDangerLevel(value) {
    if (value < 30) return { level: 'humidity-low', text: 'Превише суво', icon: 'fa-tint-slash' };
    if (value < 40) return { level: 'moderate', text: 'Суво', icon: 'fa-tint' };
    if (value < 60) return { level: 'low', text: 'Оптимално', icon: 'fa-tint' };
    if (value < 70) return { level: 'moderate', text: 'Влажно', icon: 'fa-cloud-rain' };
    return { level: 'humidity-high', text: 'Превише влажно', icon: 'fa-cloud-showers-heavy' };
}

// Функција за ажурирање индикатора опасности
function updateDangerIndicator(cardId, value, getDangerLevel, sensorIndex) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const sensorValue = card.querySelectorAll('.sensor-value')[sensorIndex];
    if (!sensorValue) return;

    const dangerIndicatorElement = sensorValue.querySelector('.danger-indicator');
    const statusIconElement = sensorValue.querySelector('.status-icon i');
    
    if (!dangerIndicatorElement || !statusIconElement) return;

    const dangerInfo = getDangerLevel(value);
    
    // Ажурирање боје индикатора
    dangerIndicatorElement.style.backgroundColor = getDangerColor(dangerInfo.level);
    
    // Ажурирање иконице и њене боје
    statusIconElement.className = 'fas ' + dangerInfo.icon;
    statusIconElement.style.color = getDangerColor(dangerInfo.level);
    
    // Додавање класе за анимацију ако је ниво опасности висок
    const statusIcon = sensorValue.querySelector('.status-icon');
    if (dangerInfo.level === 'hazardous' || dangerInfo.level === 'dangerous') {
        statusIcon.classList.add('animated');
    } else {
        statusIcon.classList.remove('animated');
    }
}

// Функција за добијање боје индикатора
function getDangerColor(level) {
    const colors = {
        'low': '#4CAF50',      // Зелено
        'moderate': '#FFC107',  // Жуто
        'unhealthy': '#FF9800', // Наранџасто
        'very-unhealthy': '#F44336', // Црвено
        'hazardous': '#9C27B0', // Љубичасто
        'dangerous': '#F44336', // Црвено
        'pressure-low': '#2196F3', // Плаво
        'pressure-high': '#9C27B0', // Љубичасто
        'humidity-low': '#FFC107',  // Жуто
        'humidity-high': '#2196F3'  // Плаво
    };
    return colors[level] || '#4CAF50';
}

// Функција за ажурирање података сензора
async function updateSensorData() {
    try {
        console.log('Започињем преузимање података...');
        const response = await fetch(API_URL);
        console.log('Одговор примљен:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Цео објекат података:', data);
        
        if (!Array.isArray(data)) {
            console.error('Примљени подаци нису низ:', data);
            return;
        }

        if (data.length === 0) {
            console.error('Примљени низ је празан');
            return;
        }

        // Узимамо податке за сва три сензора
        const sensorData1 = data[0];
        const sensorData2 = data[1];
        const sensorData3 = data[3];

        // Функција за ажурирање локација сензора
        const updateSensorLocations = () => {
            const updateLocation = (metricId, sensorData, index) => {
                const locationElement = document.querySelector(`#${metricId} .sensor-value:nth-child(${index + 1}) .sensor-location`);
                if (locationElement && sensorData.location) {
                    // Уклањамо "АТВСС" део из локације
                    const cleanLocation = sensorData.location.replace(/^АТВСС\s*/, '');
                    locationElement.textContent = cleanLocation;
                }
            };

            // Ажурирамо локације за сваку метрику
            metrics.forEach(metric => {
                updateLocation(metric.id, sensorData1, 0);
                updateLocation(metric.id, sensorData2, 1);
                updateLocation(metric.id, sensorData3, 2);
            });
        };

        // Ажурирамо локације сензора
        updateSensorLocations();
        
        // Ажурирање времена
        const timestamp = document.getElementById('timestamp');
        if (timestamp && sensorData2.timestamp) {
            const date = new Date(sensorData2.timestamp);
            timestamp.textContent = date.toLocaleString('sr-RS');
        }
        
        // Функција за безбедно ажурирање вредности
        const safeUpdateValue = (selector, value) => {
            const element = document.querySelector(selector);
            if (element && value !== undefined && value !== null) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    element.textContent = numValue.toFixed(1);
                    console.log(`Ажурирана вредност за ${selector}:`, numValue);
                }
            }
        };

        // Функција за ажурирање вредности сва три сензора
        const updateSensorValues = (metricId, sensor1Value, sensor2Value, sensor3Value) => {
            const card = document.getElementById(metricId);
            if (!card) return;

            const sensorValues = card.querySelectorAll('.sensor-data-value');
            if (sensorValues.length === 3) {
                safeUpdateValue(`#${metricId} .sensor-value:nth-child(1) .sensor-data-value`, sensor1Value);
                safeUpdateValue(`#${metricId} .sensor-value:nth-child(2) .sensor-data-value`, sensor2Value);
                safeUpdateValue(`#${metricId} .sensor-value:nth-child(3) .sensor-data-value`, sensor3Value);
            }
        };
        
        // Ажурирање PM вредности
        updateSensorValues('pm1', sensorData1.pm1, sensorData2.pm1, sensorData3.pm1);
        updateSensorValues('pm25', sensorData1.pm25, sensorData2.pm25, sensorData3.pm25);
        updateSensorValues('pm10', sensorData1.pm10, sensorData2.pm10, sensorData3.pm10);
        
        // Ажурирање температуре, притиска и влажности
        updateSensorValues('temperature', sensorData1.temperature, sensorData2.temperature, sensorData3.temperature);
        updateSensorValues('pressure', sensorData1.pressure, sensorData2.pressure, sensorData3.pressure);
        updateSensorValues('humidity', sensorData1.humidity, sensorData2.humidity, sensorData3.humidity);

        // Ажурирање индикатора опасности за сва три сензора
        const updateIndicators = (metricId, getDangerLevel) => {
            updateDangerIndicator(metricId, sensorData1[metricId], getDangerLevel, 0);
            updateDangerIndicator(metricId, sensorData2[metricId], getDangerLevel, 1);
            updateDangerIndicator(metricId, sensorData3[metricId], getDangerLevel, 2);
        };

        updateIndicators('pm1', getPM1DangerLevel);
        updateIndicators('pm25', getPM25DangerLevel);
        updateIndicators('pm10', getPM10DangerLevel);
        updateIndicators('temperature', getTemperatureDangerLevel);
        updateIndicators('pressure', getPressureDangerLevel);
        updateIndicators('humidity', getHumidityDangerLevel);

        console.log('Ажурирање завршено успешно');
    } catch (error) {
        console.error('Грешка при преузимању података:', error);
    }
}

// Иницијализација апликације
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM учитан, започињем иницијализацију...');
    
    // Прво ажурирање
    await updateSensorData();
    console.log('Прво ажурирање завршено');
    
    // Постављање интервала за периодично ажурирање на 2 минута (120000 ms)
    setInterval(updateSensorData, 120000);
    console.log('Постављен интервал за ажурирање на 2 минута');
});

window.addEventListener('click', function(e) {
    console.log(e.target)
    if (e.target.classList.contains('appstim-logo')) {
        window.location.href = 'odsekPirot.html';
    }
    if (e.target.classList.contains('akademija-logo')) {
        window.location.href = 'index.html';
    }
});