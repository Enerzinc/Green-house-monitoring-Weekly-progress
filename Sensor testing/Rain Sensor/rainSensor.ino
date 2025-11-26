#include "rainSensor.h"

// This creates an object of the RainSensor class 
//  it also assign AO-> A0, DO-> 2
RainSensor rainSensor(A0, 2); 


void setup() {
  // Sets up the serial monitor
  Serial.begin(115200);
}

void loop() {

  rainSensor.readSensor(); // Update readings

  //Reads both analog and digital signals from the rain sensor.
  Serial.print("Analog Value: ");
  Serial.print(rainSensor.getAnalogValue());
  Serial.print(" | Digital State: ");
  Serial.println(rainSensor.getDigitalState());


  delay(2000);
}