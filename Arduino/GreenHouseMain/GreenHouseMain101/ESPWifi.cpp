#include "ESPWiFi.h"

ESPWiFi::ESPWiFi(Stream &serial) : _esp(serial) {}
void ESPWiFi::begin(long baud) { delay(2000); }

void ESPWiFi::sendCommand(const char* cmd) {
  Serial.print(">> ");
  Serial.println(cmd);
  _esp.println(cmd);
}


bool ESPWiFi::waitFor(const char* target, unsigned long timeout) {
  unsigned long start = millis();
  String buffer;
  while (millis() - start < timeout) {
    while (_esp.available()) {
      buffer += (char)_esp.read();
      if (buffer.indexOf(target) >= 0) return true;
    }
  }
  return false;
}

bool ESPWiFi::connectWiFi(const char* ssid, const char* pass) {
  // Reset module (many AT firmwares require it)
  sendCommand("AT+RST");
  waitFor("ready", 5000);
  delay(1000);

  // Set mode to Station
  sendCommand("AT+CWMODE=1");
  waitFor("OK", 2000);

  // Disconnect first (avoid errors)
  sendCommand("AT+CWQAP");
  waitFor("OK", 1500);

  // Try to connect
  String cmd = "AT+CWJAP=\"";
  cmd += ssid;
  cmd += "\",\"";
  cmd += pass;
  cmd += "\"";

  sendCommand(cmd.c_str());

  if (waitFor("WIFI GOT IP", 12000)) return true;
  if (waitFor("WIFI CONNECTED", 12000)) return true;
  if (waitFor("OK", 12000)) return true;

  return false;
}


String ESPWiFi::postJSON(const char* host, uint16_t port, const char* path, const char* json) {
  String response = "";

  // --- Start TCP ---
  String cmd = "AT+CIPSTART=\"TCP\",\"";
  cmd += host;
  cmd += "\"," + String(port);
  sendCommand(cmd.c_str());

  if (!waitFor("CONNECT", 5000)) return "ERR_CONNECT";

  String req = "POST ";
  req += path;
  req += " HTTP/1.1\r\nHost: ";
  req += host;
  req += "\r\nContent-Type: application/json\r\nContent-Length: ";
  req += String(strlen(json));
  req += "\r\nConnection: close\r\n\r\n";
  req += json;

  sendCommand(("AT+CIPSEND=" + String(req.length())).c_str());
  if (!waitFor(">", 3000)) return "ERR_PROMPT";

  _esp.print(req);

  if (!waitFor("SEND OK", 4000)) return "ERR_SEND";
  
  delay(500);

  unsigned long start = millis();
  while (millis() - start < 3000) {
    while (_esp.available()) {
      response += (char)_esp.read();
    }
  }
  sendCommand("AT+CIPCLOSE");
  delay(200);
  return response;
}
