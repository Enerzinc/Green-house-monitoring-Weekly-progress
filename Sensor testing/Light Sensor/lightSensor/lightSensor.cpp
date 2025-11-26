#include "lightSensor.h"
#include "Arduino.h"

//initializes pre requisite pins/values
lightSensor::lightSensor(int lsIn){
  _lsIn= lsIn;
}

//gathers value
void lightSensor::senseLight(){
  _rawLvl = analogRead(_lsIn);
  _lvl = map(_rawLvl, 0, 1023, 0, 100);


}


//prints gathered value on the serial
void lightSensor::printLl(){

  Serial.print("Light Level: ");
  Serial.println(100 -_lvl);

}



