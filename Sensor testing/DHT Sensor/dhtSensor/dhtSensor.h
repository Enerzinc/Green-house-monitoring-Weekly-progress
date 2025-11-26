#ifndef DHTSENSOR_H
#define DHTSENSOR_H

#include "Arduino.h"
#include <DHT.h>

class dhtSensor {
  public:

    // initializing functions
    dhtSensor(uint8_t dhtPin, uint8_t dhtType);
    void begin();
    void getVal();
    void printVal();
    float getTemperature();
    float getHumidity();

  private:
    // initializing variables
    uint8_t _dhtPin;
    uint8_t _dhtType;
    float _hVal;
    float _tVal;
    DHT _dht;
};

#endif
