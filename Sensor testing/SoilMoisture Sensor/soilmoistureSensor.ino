#include "soilmoistureSensor.h"

// This creates an object of the soilmoisture class 
//  it also assign AO-> A0, DO-> 2
SoilmoistureSensor soilmoistureSensor(A0, 2); 



void setup() {
  // Sets up the serial monitor
  Serial.begin(115200);
}

void loop() {
  soilmoistureSensor.readSensor(); // Update readings

  //Reads both analog and digital signals from the soil moisture Sensor.
  Serial.print("Analog Value: ");
  Serial.print(soilmoistureSensor.getAnalogValue());
  Serial.print(" | Digital State: ");
  Serial.println(soilmoistureSensor.getDigitalState());

  delay(2000);

}
