#ifndef SOILMOISTURESENSOR_H  // if not defined. this prevents redefinition
#define SOILMOISTURESENSOR_H  // define


#include <Arduino.h>

class SoilmoistureSensor{
  public: 
    SoilmoistureSensor (int analogPin, int digitalPin); // Constructor 

    // Function Interface
    // Reads the sensor values
    void readSensor();
    //get analog and digital values
    int getAnalogValue();
    int getDigitalState();



  private:
    // Variable Interface
    int _analogPin;
    int _digitalPin;
    int _analogValue;
    int _digitalState;
};


#endif