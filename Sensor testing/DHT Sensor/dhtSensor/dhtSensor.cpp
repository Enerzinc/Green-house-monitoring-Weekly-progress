#include "dhtSensor.h"
#include <DHT.h>

//initializing passed pins
dhtSensor::dhtSensor(uint8_t dhtPin, uint8_t dhtType)
  : _dhtPin(dhtPin), _dhtType(dhtType), _dht(dhtPin, dhtType) {}

//intializing dht library/module
void dhtSensor::begin() {
  _dht.begin();
}

//get values
void dhtSensor::getVal() {
  _hVal = _dht.readHumidity();
  _tVal = _dht.readTemperature();
}

//prints gathered values
void dhtSensor::printVal() {
  Serial.print("Temperature: ");
  Serial.print(_tVal);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(_hVal);
  Serial.println(" %");
}
