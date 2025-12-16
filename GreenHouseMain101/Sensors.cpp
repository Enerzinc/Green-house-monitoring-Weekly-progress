#include "Sensors.h"
#define SOIL_DRY_MAX  900 
#define SOIL_WET_MIN  300 

SensorSystem::SensorSystem(int dhtPin, int dhtType, int lightPin, int soilPin, int rainPin)
: _dht(dhtPin, dhtType)
{
    _dhtPin = dhtPin;
    _dhtType = dhtType;
    _lightPin = lightPin;
    _soilPin = soilPin;
    _rainPin = rainPin;
}

void SensorSystem::begin() {
    pinMode(_lightPin, INPUT);
    pinMode(_soilPin, INPUT);
    pinMode(_rainPin, INPUT_PULLUP);
    _dht.begin();
}

float SensorSystem::readTemp() {
    return _dht.readTemperature();
}

float SensorSystem::readHumid() {
    return _dht.readHumidity();
}

int SensorSystem::readLight() {
    int rawValue = analogRead(_lightPin);
    int percentage = map(rawValue, 0, 1023, 100, 0);

    if (percentage < 0) { percentage = 0; }
    if (percentage > 100) { percentage = 100; }

    return percentage;
}

int SensorSystem::readSoil() {          
    int rawValue = analogRead(_soilPin);

    if (rawValue > SOIL_DRY_MAX) { rawValue = SOIL_DRY_MAX; }
    if (rawValue < SOIL_WET_MIN) { rawValue = SOIL_WET_MIN; }
    
    int percentage = map(rawValue, SOIL_DRY_MAX, SOIL_WET_MIN, 0, 100);

    return percentage;     
}

bool SensorSystem::readRain() {
    return !digitalRead(_rainPin);  
}
