#ifndef ESP_WIFI_H
#define ESP_WIFI_H

#include <Arduino.h>

class ESPWiFi {
public:
  ESPWiFi(Stream &serial);
  void begin(long baud = 9600);
  bool connectWiFi(const char* ssid, const char* pass);
  String postJSON(const char* host, uint16_t port, const char* path, const char* json);

private:
  Stream &_esp;
  void sendCommand(const char* cmd);
  bool waitFor(const char* target, unsigned long timeout = 3000);
};

#endif
