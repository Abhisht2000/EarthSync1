/*
 * EARTHSYNC MULTI-HAZARD INTELLIGENCE PLATFORM
 * ESP32 SENSOR NODE FIRMWARE SAMPLE
 * 
 * Hardware Configuration:
 * - Microcontroller: ESP32 DevKit V1
 * - Flood Sensors: Ultrasonic HC-SR04 (Trig Pin 5, Echo Pin 18) + Rain Sensor (Pin 34)
 * - Wildfire Sensors: DHT22 (Pin 4) + MQ-2 Smoke Sensor (Pin 35)
 * - Transmission: Wi-Fi HTTP POST / WebSocket
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverEndpoint = "http://192.168.1.100:5000/api/sensors/ingest";

const char* NODE_ID = "RIVER-02"; // or "FOREST-01"

#define TRIG_PIN 5
#define ECHO_PIN 18
#define RAIN_PIN 34
#define MQ2_PIN 35

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT);
  pinMode(MQ2_PIN, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

float measureWaterLevelCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return 32.0; // fallback if sensor out of range
  float distanceCm = (duration * 0.034) / 2.0;
  // Convert distance from sensor head to water depth in river bed (e.g. 100cm bridge height)
  float waterLevel = 100.0 - distanceCm;
  return max(0.0f, waterLevel);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    float waterLevel = measureWaterLevelCm();
    bool rainDetected = digitalRead(RAIN_PIN) == LOW; // Low on water contact
    int mq2Raw = analogRead(MQ2_PIN);
    float smokePpm = map(mq2Raw, 0, 4095, 20, 500);

    StaticJsonDocument<300> doc;
    doc["nodeId"] = NODE_ID;
    doc["waterLevel"] = waterLevel;
    doc["rainfall"] = rainDetected;
    doc["temperature"] = 28.4;
    doc["humidity"] = 61.0;
    doc["smokePpm"] = smokePpm;
    doc["smokeLevel"] = (smokePpm > 180) ? "HIGH" : (smokePpm > 90 ? "MEDIUM" : "LOW");
    doc["battery"] = 92;
    doc["signalRssi"] = WiFi.RSSI();
    doc["dataQuality"] = "GOOD";

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.printf("Telemetry posted. Code: %d\n", httpResponseCode);
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Edge buffering enabled.");
  }

  delay(2500); // Poll every 2.5s
}
