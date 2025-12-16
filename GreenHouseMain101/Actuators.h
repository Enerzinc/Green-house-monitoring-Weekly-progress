#ifndef ACTUATORS_H
#define ACTUATORS_H

#include <Arduino.h>
#include <Servo.h> 

class ActuatorSystem {
  public:
    ActuatorSystem(int servo1Pin, int servo2Pin, int pumpIn1, int pumpIn2, int pumpEna);
    void begin();
    void stopAll(); 
    void automatedControl(float humidity, int soilMoisture, bool isRaining);

  private:
    int _s1Pin, _s2Pin;
    int _pump1, _pump2, _pumpEna;
    int _uniformSpeed; 
    Servo _servo1, _servo2;

    const float HUMIDITY_THRESHOLD = 70.0; 
    const int SOIL_DRY_THRESHOLD = 800;    
    const int SOIL_WET_THRESHOLD = 400;    
    bool _pumpIsOn; 
};

#endif