#include <SoftwareSerial.h>
#include <avr/sleep.h>
#include <avr/interrupt.h>
#include <stdlib.h>
#include "ESPWiFi.h"
#include "SensorS.h"

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

bool wifiConnected  = false;
bool wifiConnecting = false;

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

// WiFi LED blink
unsigned long lastWifiBlink = 0;
bool wifiLedState = false;
const unsigned long WIFI_BLINK_INTERVAL = 300;

// Button debounce
volatile unsigned long lastButtonISR = 0;

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
//               WIFI LED HANDLER
// ==================================================
void handleWiFiLed() {
  if (wifiConnecting && !wifiConnected) {
    digitalWrite(LED_PIN, HIGH);   // 🔴 ON while connecting
  }
  else if (wifiConnected) {
    digitalWrite(LED_PIN, LOW);    // 🟢 OFF when connected
  }
}
void blinkDataSent() {
  digitalWrite(LED_PIN, HIGH);
  delay(60);
  digitalWrite(LED_PIN, LOW);
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

  detachInterrupt(digitalPinToInterrupt(BUTTON_PIN));
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), wakeUpISR, FALLING);

  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_enable();
  sei();
  sleep_cpu();

  // ---- WAKE ----
  sleep_disable();
  detachInterrupt(digitalPinToInterrupt(BUTTON_PIN));
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonISR, FALLING);

  sleeping = false;
  justWokeUp = true;   // ⭐ KEY LINE

  Serial.println("Woke up from sleep!");
}


// ==================================================
//               ACTIVE MODES
// ==================================================
void handleActiveModes() {
  unsigned long now = millis();
  unsigned long interval =
    (currentMode == MODE_AUTO) ? AUTO_INTERVAL : MAINT_INTERVAL;

  if (!wifiConnected) {
    wifiConnecting = true;
    wifiConnected = esp.connectWiFi(WIFI_SSID, WIFI_PASS);

    if (wifiConnected) {
      wifiConnecting = false;
      Serial.println("WiFi connected");
    }
  }

  handleWiFiLed();

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

  char json[300];
  snprintf(json, sizeof(json),
    "{\"mode\":\"%s\",\"temp\":%.1f,\"humid\":%.1f,"
    "\"light\":%d,\"soil\":%d,\"rain\":%s}",
    modeToString(currentMode),
    temp, humid, light, soil,
    rain ? "true" : "false"
  );

  Serial.print("Sending JSON: ");
  Serial.println(json);

  esp.postJSON(SERVER_HOST, SERVER_PORT, SERVER_PATH, json);
  blinkDataSent(); 
}

// ==================================================
//                    SETUP
// ==================================================
void setup() {
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
void loop() {

  if (buttonEvent) {
    buttonEvent = false;
    lastMode = currentMode;
    justWokeUp = false;

    switch (currentMode) {
      case MODE_MAINT: currentMode = MODE_SLEEP; break;
      case MODE_SLEEP: currentMode = MODE_AUTO;  break;
      case MODE_AUTO:  currentMode = MODE_MAINT; break;
    }

    Serial.print("Button pressed → Mode changed: ");
    Serial.print(modeToString(lastMode));
    Serial.print(" → ");
    Serial.println(modeToString(currentMode));

    lastSendTime = millis();
  }

  if (currentMode == MODE_SLEEP && !justWokeUp) {
  goToSleep();
  }
  else {
    handleActiveModes();
  }
}

// ==================================================
//                  INTERRUPT
// ==================================================
void buttonISR() {
  unsigned long now = millis();
  if (now - lastButtonISR > 300) {
    buttonEvent = true;
    lastButtonISR = now;
  }
}
