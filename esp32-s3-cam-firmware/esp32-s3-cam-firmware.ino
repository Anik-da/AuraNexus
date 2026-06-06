/**
 * AURANEXUS ESP32-S3 CAM Integration Firmware
 * Coordinates smart agricultural diagnostics, camera streaming, and sensor telemetry.
 *
 * Supported Boards:
 *  - Freenove ESP32-S3 CAM (Default Pinout)
 *  - Espressif ESP32-S3-EYE
 *  - Generic ESP32-S3 OV2640 Modules
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClient.h>

// ==========================================
// 1. NETWORK & GATEWAY CONFIGURATION
// ==========================================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Target IP and Port of your FastAPI backend server
const char* serverIP = "192.168.1.100";  // Change to your laptop/server IP
const int serverPort = 8000;              // Change to your FastAPI Port

// Execution intervals (in milliseconds)
const unsigned long frameInterval = 200;      // 5 FPS (200ms delay)
const unsigned long sensorInterval = 5000;    // Every 5 seconds

unsigned long lastFrameTime = 0;
unsigned long lastSensorTime = 0;

// ==========================================
// 2. CAMERA PIN DEFINITIONS
// ==========================================
// Select your board by uncommenting one section:

// --- BOARD: FREENOVE ESP32-S3 WROOM CAM (Default) ---
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     15
#define SIOD_GPIO_NUM     4
#define SIOC_GPIO_NUM     5

#define Y9_GPIO_NUM       16
#define Y8_GPIO_NUM       17
#define Y7_GPIO_NUM       18
#define Y6_GPIO_NUM       12
#define Y5_GPIO_NUM       10
#define Y4_GPIO_NUM       8
#define Y3_GPIO_NUM       9
#define Y2_GPIO_NUM       11
#define VSYNC_GPIO_NUM    6
#define HREF_GPIO_NUM     7
#define PCLK_GPIO_NUM     13

/* 
// --- BOARD: ESPRESSIF ESP32-S3-EYE (Alternate) ---
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     15
#define SIOD_GPIO_NUM     4
#define SIOC_GPIO_NUM     5

#define Y9_GPIO_NUM       16
#define Y8_GPIO_NUM       17
#define Y7_GPIO_NUM       18
#define Y6_GPIO_NUM       12
#define Y5_GPIO_NUM       10
#define Y4_GPIO_NUM       8
#define Y3_GPIO_NUM       9
#define Y2_GPIO_NUM       11
#define VSYNC_GPIO_NUM    6
#define HREF_GPIO_NUM     7
#define PCLK_GPIO_NUM     13
*/

// ==========================================
// 3. CORE HARDWARE INITIALIZATION
// ==========================================
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_QVGA;    // QVGA (320x240) optimized for fast YOLOv8 inference
  config.pixel_format = PIXFORMAT_JPEG; // Must be JPEG
  config.grab_mode = CAMERA_GRAB_LATEST;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;             // 0-63 (lower is higher quality)
  config.fb_count = 2;                  // Double buffer for smoother streaming

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera initialization failed with error 0x%x\n", err);
    return false;
  }
  
  sensor_t * s = esp_camera_sensor_get();
  // Image adjustments (flip if camera orientation is inverted)
  s->set_vflip(s, 0); 
  s->set_hmirror(s, 0);
  
  Serial.println("OV2640 Camera module successfully initialized.");
  return true;
}

// ==========================================
// 4. MULTIPART HTTP POST STREAMING
// ==========================================
void sendCameraFrame() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Error: Failed to capture frame from OV2640 sensor.");
    return;
  }

  WiFiClient client;
  if (!client.connect(serverIP, serverPort)) {
    Serial.println("Connection to AuraNexus Gateway failed.");
    esp_camera_fb_return(fb);
    return;
  }

  // Construct standard HTTP multipart boundaries
  String boundary = "AuraNexusBoundary";
  String header = "--" + boundary + "\r\n" +
                  "Content-Disposition: form-data; name=\"file\"; filename=\"frame.jpg\"\r\n" +
                  "Content-Type: image/jpeg\r\n\r\n";
  String footer = "\r\n--" + boundary + "--\r\n";

  uint32_t totalLen = header.length() + fb->len + footer.length();

  // Transmit HTTP Request header
  client.println("POST /api/v1/esp32/frame HTTP/1.1");
  client.println("Host: " + String(serverIP) + ":" + String(serverPort));
  client.println("Content-Type: multipart/form-data; boundary=" + boundary);
  client.println("Content-Length: " + String(totalLen));
  client.println("Connection: close");
  client.println();

  // Stream raw payload chunks to prevent socket timeout
  client.print(header);
  
  // Write camera buffer contents
  uint8_t *fbBuf = fb->buf;
  size_t fbLen = fb->len;
  const size_t chunkSize = 1024;
  
  for (size_t i = 0; i < fbLen; i += chunkSize) {
    size_t currentChunk = (fbLen - i < chunkSize) ? (fbLen - i) : chunkSize;
    client.write(fbBuf + i, currentChunk);
  }
  
  client.print(footer);
  
  // Return camera framebuffer immediately
  esp_camera_fb_return(fb);

  // Parse server feedback response (useful for logging target detections on device)
  while (client.connected() && !client.available()) {
    delay(1);
  }
  
  if (client.available()) {
    String responseLine = client.readStringUntil('\r');
    if (responseLine.indexOf("200 OK") != -1) {
      Serial.println("Frame successfully sent and processed by YOLOv8 model.");
    } else {
      Serial.println("Warning: Gateway rejected frame. Code: " + responseLine);
    }
  }
  
  client.stop();
}

// ==========================================
// 5. JSON TELEMETRY POST SENSORS
// ==========================================
void sendSensorTelemetry() {
  // Read simulated sensor data (replace with actual DHT22 / Soil capacitive sensors)
  float temperature = 22.0 + (random(0, 50) / 10.0); // Drift 22°C - 27°C
  float humidity = 55.0 + (random(0, 150) / 10.0);   // Drift 55% - 70%
  float soilMoisture = 35.0 + (random(0, 200) / 10.0); // Drift 35% - 55%

  WiFiClient client;
  if (!client.connect(serverIP, serverPort)) {
    Serial.println("Telemetry server link failed.");
    return;
  }

  // Construct JSON Body
  String jsonPayload = "{\"temperature\":" + String(temperature, 1) + 
                       ",\"humidity\":" + String(humidity, 1) + 
                       ",\"soil_moisture\":" + String(soilMoisture, 1) + "}";

  client.println("POST /api/v1/esp32/sensor-data HTTP/1.1");
  client.println("Host: " + String(serverIP) + ":" + String(serverPort));
  client.println("Content-Type: application/json");
  client.println("Content-Length: " + String(jsonPayload.length()));
  client.println("Connection: close");
  client.println();
  client.print(jsonPayload);

  while (client.connected() && !client.available()) {
    delay(1);
  }
  if (client.available()) {
    String responseLine = client.readStringUntil('\r');
    Serial.println("Sensor Telemetry sync result: " + responseLine);
  }

  client.stop();
}

// ==========================================
// 6. MAIN SYSTEM RUN LOOPS
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\n--- Starting AuraNexus Client Setup ---");

  // Initialize ESP32-S3-CAM OV2640 Module
  if (!initCamera()) {
    Serial.println("Fatal Error: Hardware camera initialization failed.");
    while (true) { delay(1000); } // Halt program
  }

  // Setup Wi-Fi connection
  WiFi.begin(ssid, password);
  Serial.printf("Attempting Connection to SSID: %s\n", ssid);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Link Established.");
  Serial.print("Local IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    delay(2000);
    return;
  }

  unsigned long currentMillis = millis();

  // Task 1: Stream Camera Frames (YOLOv8 Core)
  if (currentMillis - lastFrameTime >= frameInterval) {
    lastFrameTime = currentMillis;
    sendCameraFrame();
  }

  // Task 2: Stream Sensor Data (JSON Telemetry)
  if (currentMillis - lastSensorTime >= sensorInterval) {
    lastSensorTime = currentMillis;
    sendSensorTelemetry();
  }
}
