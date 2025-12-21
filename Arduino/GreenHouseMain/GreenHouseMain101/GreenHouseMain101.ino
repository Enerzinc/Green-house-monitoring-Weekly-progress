#include <SoftwareSerial.h>
#include <avr/sleep.h>
#include <avr/interrupt.h>
#include <stdlib.h>
#include "ESPWiFi.h"
#include "SensorS.h"

#include <avr/power.h>
#include <avr/sleep.h>
#include <avr/wdt.h>

// ==================================================
//                     MODES
// ==================================================
enum Mode {
  MODE_MAINT = 0,
  MODE_SLEEP = 1,
  MODE_AUTO  = 2
};


volatile Mode currentMode = MODE_MAINT;
Mode lastMode = MODE_MAINT;

// ==================================================
//                     FLAGS
// ==================================================
volatile bool buttonEvent = false;
volatile bool sleeping = false;
volatile bool justWokeUp = false;

bool wifiConnected = false;
bool modeSynced = true;

// ==================================================
//                     PINS
// ==================================================
#define DHT_PIN     6
#define RAIN_PIN    7
#define SOIL_PIN    A0
#define LIGHT_PIN   A1
#define BUTTON_PIN  2
#define RX_PIN      4
#define TX_PIN      5
#define LED_PIN     LED_BUILTIN
#define DHT_TYPE    DHT11

// ==================================================
//                NETWORK CONFIG
// ==================================================
const char* WIFI_SSID   = "hello";
const char* WIFI_PASS   = "hello123";
const char* SERVER_HOST = "192.168.125.41";
const uint16_t SERVER_PORT = 3000;
const char* SERVER_PATH = "/api/sensors";



// ==================================================
//                  TIMING
// ==================================================
const unsigned long MAINT_INTERVAL = 5000;
const unsigned long AUTO_INTERVAL  = 600000;
unsigned long lastSendTime = 0;

unsigned long lastButtonTime = 0;   


// ==================================================
//                 OBJECTS
// ==================================================
SoftwareSerial espSerial(RX_PIN, TX_PIN);
ESPWiFi esp(espSerial);
SensorSystem sensors(DHT_PIN, DHT_TYPE, LIGHT_PIN, SOIL_PIN, RAIN_PIN);

// ==================================================
//              MODE TO STRING
// ==================================================
const char* modeToString(Mode m) {
  switch (m) {
    case MODE_MAINT: return "MAINT";
    case MODE_SLEEP: return "SLEEP";
    case MODE_AUTO:  return "AUTO";
    default:         return "UNKNOWN";
  }
}

// ==================================================
//               SLEEP
// ==================================================
void wakeUpISR() {}

void goToSleep() {
  if (sleeping) return;
  sleeping = true;

  Serial.println("Entering sleep mode...");
  Serial.flush();

  digitalWrite(LED_PIN, LOW);

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonISR, FALLING);

  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_enable();
  sei();
  sleep_cpu();

  sleep_disable();
  detachInterrupt(digitalPinToInterrupt(BUTTON_PIN));
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonISR, FALLING);

  sleeping = false;
  justWokeUp = true;

  Serial.println("Woke up from sleep!");
}

// ==================================================
//           WIFI + SENSOR DATA SEND
// ==================================================
void handleActiveModes() {

  unsigned long now = millis();
  unsigned long interval =
    (currentMode == MODE_AUTO) ? AUTO_INTERVAL : MAINT_INTERVAL;

  static unsigned long lastWiFiTry = 0;

  if (!wifiConnected && millis() - lastWiFiTry > 5000) {
    lastWiFiTry = millis();
    digitalWrite(LED_PIN, HIGH);
    wifiConnected = esp.connectWiFi(WIFI_SSID, WIFI_PASS);
    digitalWrite(LED_PIN, LOW);
    if (wifiConnected) Serial.println("WiFi connected");
    
  }

  if (!wifiConnected) return;
  if (now - lastSendTime < interval) return;

  lastSendTime = now;

  float temp  = sensors.readTemp();
  float humid = sensors.readHumid();
  int light   = sensors.readLight();
  int soil    = sensors.readSoil();
  bool rain   = sensors.readRain();

  if (isnan(temp))  temp = 0;
  if (isnan(humid)) humid = 0;

  char tempStr[10], humidStr[10], json[300];
  dtostrf(temp, 4, 1, tempStr);
  dtostrf(humid, 4, 1, humidStr);

  snprintf(json, sizeof(json),
    "{\"mode\":\"%s\",\"temp\":%s,\"humid\":%s,"
    "\"light\":%d,\"soil\":%d,\"rain\":%s,\"ts\":%lu}",
    modeToString(currentMode),
    tempStr, humidStr, light, soil,
    rain ? "true" : "false",
    millis()
  );

  Serial.print("Sending SENSOR JSON: ");
  Serial.println(json);
  digitalWrite(LED_PIN, HIGH);
  String reply = esp.postJSON(
    SERVER_HOST, SERVER_PORT, SERVER_PATH, json
  );
  digitalWrite(LED_PIN, LOW);
  Serial.print("Server Reply: ");
  Serial.println(reply);
}

// ==================================================
//           MODE STATE MACHINE
// ==================================================
void handleCurrentMode() {
  switch (currentMode) {
    case MODE_MAINT:
      handleActiveModes();
      break;

    case MODE_AUTO:
      handleActiveModes();
      break;

    case MODE_SLEEP:
      if (modeSynced && !justWokeUp) {
        goToSleep();
      }
      break;
  }
}

// ==================================================
//                    SETUP
// ==================================================
void setup() {
  power_spi_disable();
  power_twi_disable();

  Serial.begin(9600);
  espSerial.begin(9600);

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonISR, FALLING);

  sensors.begin();
  esp.begin(9600);

  lastSendTime = millis();
}

// ==================================================
//                     LOOP
// ==================================================
// ==================================================
//               LED BLINK HELPER
// ==================================================
void blinkLED(uint8_t times, uint16_t delayMs) {
  for (uint8_t i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

void loop() {

  // -------- BUTTON HANDLING --------
  if (buttonEvent) {
  buttonEvent = false;
   unsigned long now = millis();
  if (now - lastButtonTime < 300) return; // debounce
  lastButtonTime = now;
  lastMode = currentMode;
  justWokeUp = false;

  switch (currentMode) {
    case MODE_MAINT: currentMode = MODE_SLEEP; break;
    case MODE_SLEEP: currentMode = MODE_AUTO;  break;
    case MODE_AUTO:  currentMode = MODE_MAINT; break;
  }

  modeSynced = false;

  Serial.print("Button pressed → Mode changed: ");
  Serial.print(modeToString(lastMode));
  Serial.print(" → ");
  Serial.println(modeToString(currentMode));

  switch (currentMode) {
    case MODE_MAINT:
      blinkLED(1, 200);
      break;
    case MODE_SLEEP:
      blinkLED(2, 200);
      break;
    case MODE_AUTO:
      blinkLED(3, 200);
      break;
  }
}


  // -------- MODE SYNC (CRITICAL) --------
  if (!modeSynced && wifiConnected) {
    char json[80];
    snprintf(json, sizeof(json),
      "{\"mode\":\"%s\",\"ts\":%lu}",
      modeToString(currentMode),
      millis()
    );

    Serial.print("Sending MODE sync: ");
    Serial.println(json);

    String reply = esp.postJSON(
      SERVER_HOST, SERVER_PORT, SERVER_PATH, json
    );

    Serial.print("Mode sync reply: ");
    Serial.println(reply);

    if (reply.indexOf("ok") >= 0) {
      modeSynced = true;
    }
  }

  // -------- HANDLE CURRENT MODE --------
  handleCurrentMode();
}

// ==================================================
//                  INTERRUPT
// ==================================================
void buttonISR() {

    buttonEvent = true;

}
