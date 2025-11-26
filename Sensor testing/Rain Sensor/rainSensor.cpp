  #include "rainSensor.h" //the header
  

  RainSensor::RainSensor(int analogPin, int digitalPin) {
    _analogPin = analogPin;
    _digitalPin = digitalPin;
    pinMode(_digitalPin, INPUT); //// sets the digital pin as an INPUT pin
    _analogValue = 0;
    _digitalState = HIGH; 
  }

  // Reads current sensor values
  void RainSensor::readSensor() {
    _analogValue = analogRead(_analogPin);
    _digitalState = digitalRead(_digitalPin);
  }

  // Returns the last analog value
  int RainSensor::getAnalogValue()  {
    return _analogValue;
  }

  // Returns the last digital state
  int RainSensor::getDigitalState()  {
    return _digitalState;
  }

