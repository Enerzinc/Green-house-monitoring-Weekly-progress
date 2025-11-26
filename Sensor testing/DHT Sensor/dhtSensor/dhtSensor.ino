#include "dhtSensor.h"

//initializes class and assigns dht pin and type
dhtSensor main(2, DHT11);

void setup() {
  Serial.begin(9600);
  main.begin();
}

void loop() {
  main.getVal();
  main.printVal();
  delay(2000);
}
