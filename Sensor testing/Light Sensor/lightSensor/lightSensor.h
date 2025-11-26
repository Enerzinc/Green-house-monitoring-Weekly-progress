#ifndef LIGHTSENSOR_H
#define LIGHTSENSOR_H
#include "Arduino.h"

class lightSensor{
  public:

    // initializing functions
    lightSensor(int _lsIn);
    void senseLight();
    void printLl();

  private:
    // initializing variables
    int _lsIn;
    int _lvl;
    int _rawLvl;
};

#endif
