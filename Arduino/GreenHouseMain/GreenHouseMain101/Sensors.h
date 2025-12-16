#ifndef SENSOR_H
#define SENSOR_H

#include <Arduino.h>
#include <DHT.h>

class SensorSystem {
public:
    SensorSystem(int dhtPin, int dhtType, int lightPin, int soilPin, int rainPin);
    void begin();

    float readTemp();
    float readHumid();
    int readLight();
    int readLightPercent();
    int readSoil();   
    int readSoilPercent();     
    bool readRain();

private:
    int _dhtPin, _dhtType, _lightPin, _soilPin, _rainPin;
    DHT _dht;
};

#endif
