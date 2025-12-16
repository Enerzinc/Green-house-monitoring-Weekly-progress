#include "Actuators.h"

ActuatorSystem::ActuatorSystem(int s1, int s2, int p1, int p2, int pEna) {
  _s1Pin = s1; _s2Pin = s2;
  _pump1 = p1; _pump2 = p2; _pumpEna = pEna;
  _pumpIsOn = false;
  _uniformSpeed = 200; 
}

void ActuatorSystem::begin() {
  _servo1.attach(_s1Pin);
  _servo2.attach(_s2Pin);
  pinMode(_pump1, OUTPUT);
  pinMode(_pump2, OUTPUT);
  pinMode(_pumpEna, OUTPUT); 
  stopAll();
}

void ActuatorSystem::stopAll() {
  _pumpIsOn = false;
  digitalWrite(_pump1, LOW);
  digitalWrite(_pump2, LOW);
  analogWrite(_pumpEna, 0); 
  _servo1.write(0);
  _servo2.write(0);
}

void ActuatorSystem::automatedControl(float humidity, int soilMoisture, bool isRaining) {
  
  if (isRaining) {
    _servo1.write(0); 
    _servo2.write(0);
  }
  else {
    if (humidity > HUMIDITY_THRESHOLD) {
      _servo1.write(90); 
      _servo2.write(90);
    } else {
      _servo1.write(0); 
      _servo2.write(0);
    }
  }

  if (soilMoisture > SOIL_DRY_THRESHOLD && !_pumpIsOn) {
    _pumpIsOn = true;
    digitalWrite(_pump1, HIGH);
    digitalWrite(_pump2, LOW);
    analogWrite(_pumpEna, _uniformSpeed); 
  } 
  else if (soilMoisture < SOIL_WET_THRESHOLD && _pumpIsOn) {
    _pumpIsOn = false;
    digitalWrite(_pump1, LOW);
    digitalWrite(_pump2, LOW);
    analogWrite(_pumpEna, 0); 
  }
}