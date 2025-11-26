#include "lightSensor.h"

//assign analog pin and initialize program
int pin = A0;
lightSensor _main(pin);

void setup() {
  Serial.begin(9600);
}

void loop() {
  _main.senseLight();
  _main.printLl();
  delay(1000);
}
