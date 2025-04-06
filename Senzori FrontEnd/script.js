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
    if (value < 0) return { level: 'dangerous', text: 'Опасно хладно', icon: 'fa-snowflake' };
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
function updateDangerIndicator(cardId, value, getDangerLevel) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const dangerLevelElement = card.querySelector('.danger-level');
    const dangerIndicatorElement = card.querySelector('.danger-indicator');
    const statusIconElement = card.querySelector('.status-icon i');
    
    if (!dangerLevelElement || !dangerIndicatorElement || !statusIconElement) return;

    const dangerInfo = getDangerLevel(value);
    
    // Ажурирање текста и класе опасности
    dangerLevelElement.textContent = dangerInfo.text;
    dangerLevelElement.className = 'danger-level ' + dangerInfo.level;
    
    // Ажурирање боје индикатора
    dangerIndicatorElement.style.backgroundColor = getDangerColor(dangerInfo.level);
    
    // Ажурирање иконице и њене боје
    statusIconElement.className = 'fas ' + dangerInfo.icon;
    statusIconElement.style.color = getDangerColor(dangerInfo.level);
    
    // Додавање класе за анимацију ако је ниво опасности висок
    const statusIcon = card.querySelector('.status-icon');
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

// Функција за креирање HTML структуре
function createHTMLStructure() {
    // Креирање основног контејнера
    const container = document.createElement('div');
    container.className = 'container';

    // Креирање контејнера за логотипе
    const logosContainer = document.createElement('div');
    logosContainer.className = 'logos-container';

    // Креирање логотипа за Академију
    const akademijaLogo = document.createElement('img');
    akademijaLogo.src = 'Images/akademija.png';
    akademijaLogo.alt = 'Академија';
    akademijaLogo.className = 'logo akademija-logo';

    // Креирање логотипа за Апстим
    const appstimLogo = document.createElement('img');
    appstimLogo.src = 'Images/appstim.png';
    appstimLogo.alt = 'Апстим';
    appstimLogo.className = 'logo appstim-logo';

    // Додавање логотипа у контејнер
    logosContainer.appendChild(akademijaLogo);
    logosContainer.appendChild(appstimLogo);

    // Креирање контејнера за податке сензора
    const sensorData = document.createElement('div');
    sensorData.className = 'sensor-data';

    // Креирање информација о локацији
    const locationInfo = document.createElement('div');
    locationInfo.className = 'location-info';
    
    const locationTitle = document.createElement('h2');
    locationTitle.id = 'location-title';
    locationTitle.textContent = 'Учитавање...'; // Привремена вредност док се не учита локација
    
    locationInfo.appendChild(locationTitle);

    // Креирање мреже за метрике
    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'metrics-grid';

    // Креирање картица за сваку метрику
    metrics.forEach(metric => {
        const card = createMetricCard(metric);
        metricsGrid.appendChild(card);
    });

    // Креирање времена ажурирања
    const lastUpdate = document.createElement('div');
    lastUpdate.className = 'last-update';
    lastUpdate.innerHTML = 'Последње ажурирање: <span id="timestamp"></span>';

    // Спајање свих елемената
    container.appendChild(logosContainer);
    sensorData.appendChild(locationInfo);
    sensorData.appendChild(metricsGrid);
    sensorData.appendChild(lastUpdate);
    container.appendChild(sensorData);
    document.body.appendChild(container);
}

// Функција за креирање картице метрике
function createMetricCard({ id, name, unit, icon }) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.id = id;

    const title = document.createElement('h3');
    title.textContent = name;

    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = '0.00';

    const unitElement = document.createElement('div');
    unitElement.className = 'unit';
    unitElement.textContent = unit;

    const dangerLevel = document.createElement('div');
    dangerLevel.className = 'danger-level';

    const dangerIndicator = document.createElement('div');
    dangerIndicator.className = 'danger-indicator';

    const statusIcon = document.createElement('div');
    statusIcon.className = 'status-icon';
    const iconElement = document.createElement('i');
    iconElement.className = `fas ${icon}`;
    statusIcon.appendChild(iconElement);

    card.appendChild(title);
    card.appendChild(value);
    card.appendChild(unitElement);
    card.appendChild(dangerLevel);
    card.appendChild(dangerIndicator);
    card.appendChild(statusIcon);

    return card;
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
        console.log('Тип података:', typeof data);
        
        if (!Array.isArray(data)) {
            console.error('Примљени подаци нису низ:', data);
            return;
        }

        if (data.length === 0) {
            console.error('Примљени низ је празан');
            return;
        }

        const sensorData = data[1];
        console.log('Структура података сензора:', sensorData);
        console.log('Локација:', sensorData.location);
        console.log('Сви кључеви у објекту:', Object.keys(sensorData));
        
        // Ажурирање локације
        const locationTitle = document.getElementById('location-title');
        if (locationTitle) {
            if (sensorData.location) {
                locationTitle.textContent = sensorData.location;
            } else {
                console.error('Локација није пронађена у подацима');
                locationTitle.textContent = 'Локација недоступна';
            }
        }
        
        // Ажурирање времена
        const timestamp = document.getElementById('timestamp');
        if (timestamp && sensorData.timestamp) {
            const date = new Date(sensorData.timestamp);
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

        // Функција за безбедно ажурирање индикатора
        const safeUpdateIndicator = (id, value, getDangerLevel) => {
            if (value !== undefined && value !== null) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    updateDangerIndicator(id, numValue, getDangerLevel);
                    console.log(`Ажуриран индикатор за ${id}:`, numValue);
                }
            }
        };
        
        // Ажурирање PM вредности
        safeUpdateIndicator('pm1', sensorData.pm1, getPM1DangerLevel);
        safeUpdateIndicator('pm25', sensorData.pm25, getPM25DangerLevel);
        safeUpdateIndicator('pm10', sensorData.pm10, getPM10DangerLevel);
        
        // Ажурирање температуре, притиска и влажности
        safeUpdateIndicator('temperature', sensorData.temperature, getTemperatureDangerLevel);
        safeUpdateIndicator('pressure', sensorData.pressure, getPressureDangerLevel);
        safeUpdateIndicator('humidity', sensorData.humidity, getHumidityDangerLevel);
        
        // Ажурирање вредности
        safeUpdateValue('#pm1 .value', sensorData.pm1);
        safeUpdateValue('#pm25 .value', sensorData.pm25);
        safeUpdateValue('#pm10 .value', sensorData.pm10);
        safeUpdateValue('#temperature .value', sensorData.temperature);
        safeUpdateValue('#pressure .value', sensorData.pressure);
        safeUpdateValue('#humidity .value', sensorData.humidity);

        console.log('Ажурирање завршено успешно');
    } catch (error) {
        console.error('Грешка при преузимању података:', error);
    }
}

// Додајемо CSS за анимацију ажурирања
const style = document.createElement('style');
style.textContent = `
    .updating {
        animation: updateValue 0.5s ease-out;
    }

    @keyframes updateValue {
        0% {
            transform: scale(1);
            color: #2a5298;
        }
        50% {
            transform: scale(1.2);
            color: #ff6b6b;
        }
        100% {
            transform: scale(1);
            color: #2a5298;
        }
    }

    .error-message {
        text-align: center;
        padding: 20px;
        color: #ff6b6b;
    }
    
    /* Додатне боје за индикаторе */
    .danger-indicator.low {
        background-color: #4CAF50;
    }
    
    .danger-indicator.moderate {
        background-color: #FFC107;
    }
    
    .danger-indicator.unhealthy {
        background-color: #FF9800;
    }
    
    .danger-indicator.very-unhealthy {
        background-color: #F44336;
    }
    
    .danger-indicator.hazardous {
        background-color: #9C27B0;
    }

    /* Анимација плавтања за све иконице */
    .status-icon i {
        animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }

    /* Стилови за контејнер */
    .container {
        max-width: 80%;
        margin: 0 auto;
        padding: 10px;
        box-sizing: border-box;
    }

    /* Стилови за сензор податке */
    .sensor-data {
        background: #ffffff;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        box-sizing: border-box;
        margin-top: 30px;
    }

    /* Мобилни приказ */
    @media screen and (max-width: 768px) {
        .container {
            padding: 10px;
            max-width: 100%;
        }

        .sensor-data {
            padding: 20px;
            border-radius: 15px;
            margin: 0 10px;
            margin-top: 20px;
        }

        .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .metric-card {
            padding: 10px;
            border-radius: 10px;
        }
    }

    /* Стилови за логотипе */
    .logos-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 90px;
        margin-bottom: 20px;
    }

    .logo {
        width: 181.5px;
        height: auto;
        object-fit: contain;
        display: block;
        max-width: 100%;
    }
`;
document.head.appendChild(style);

// Иницијализација апликације
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM учитан, започињем иницијализацију...');
    createHTMLStructure();
    console.log('HTML структура креирана');
    
    // Прво ажурирање
    await updateSensorData();
    console.log('Прво ажурирање завршено');
    
    // Постављање интервала за периодично ажурирање на 2 минута (120000 ms)
    setInterval(updateSensorData, 120000);
    console.log('Постављен интервал за ажурирање на 2 минута');
}); 