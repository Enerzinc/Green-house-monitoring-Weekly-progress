  #include "soilmoistureSensor.h" //the header
  

  SoilmoistureSensor::SoilmoistureSensor(int analogPin, int digitalPin) {
    _analogPin = analogPin;
    _digitalPin = digitalPin;
    pinMode(_digitalPin, INPUT); //// sets the digital pin as an INPUT pin
    _analogValue = 0;
    _digitalState = HIGH; 
  }

  // Reads current sensor values
  void SoilmoistureSensor::readSensor() {
    _analogValue = analogRead(_analogPin);
    _digitalState = digitalRead(_digitalPin);
  }

  // Returns the last analog value
  int SoilmoistureSensor::getAnalogValue()  {
    return _analogValue;
  }

  // Returns the last digital state
  int SoilmoistureSensor::getDigitalState()  {
    return _digitalState;
  }
