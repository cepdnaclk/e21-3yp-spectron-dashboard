#include <cstring>
#include <string>
#include <vector>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "driver/uart.h"
#include "esp_log.h"
#include "esp_timer.h"

static const char *TAG = "SIM800_HTTP_CPP";

// -------------------- USER CONFIG --------------------
static const int UART_PORT = UART_NUM_1;
static const int UART_TX_PIN = 17;   // ESP32 TX -> SIM800 RX
static const int UART_RX_PIN = 16;   // ESP32 RX <- SIM800 TX
static const int UART_BAUD = 9600;

// APN must match your SIM provider
static const char *APN  = "dialogbb";
static const char *USER = "";
static const char *PASS = "";

// REST endpoint (HTTP, not HTTPS)
static const char *HOST = "192.248.41.16";
static const int   PORT = 8080;
static const char *PATH = "/api/iot/upload";
// -----------------------------------------------------

static int64_t now_ms() { return esp_timer_get_time() / 1000; }

class Sim800Uart {
public:
    void init() {
        uart_config_t cfg{};
        cfg.baud_rate = UART_BAUD;
        cfg.data_bits = UART_DATA_8_BITS;
        cfg.parity    = UART_PARITY_DISABLE;
        cfg.stop_bits = UART_STOP_BITS_1;
        cfg.flow_ctrl = UART_HW_FLOWCTRL_DISABLE;
        cfg.source_clk = UART_SCLK_DEFAULT;

        ESP_ERROR_CHECK(uart_driver_install((uart_port_t)UART_PORT, 4096, 4096, 0, nullptr, 0));
        ESP_ERROR_CHECK(uart_param_config((uart_port_t)UART_PORT, &cfg));
        ESP_ERROR_CHECK(uart_set_pin((uart_port_t)UART_PORT, UART_TX_PIN, UART_RX_PIN,
                                     UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));
        flushRx();
    }

    void flushRx() { uart_flush_input((uart_port_t)UART_PORT); }

    void writeLine(const std::string &s) {
        std::string out = s + "\r\n";
        uart_write_bytes((uart_port_t)UART_PORT, out.data(), (int)out.size());
    }

    void writeRaw(const char *data, int len) {
        uart_write_bytes((uart_port_t)UART_PORT, data, len);
    }

    std::string read(int timeoutMs, int chunkWaitMs = 50) {
        std::string resp;
        resp.reserve(2048);

        int64_t start = now_ms();
        std::vector<uint8_t> buf(256);

        while ((now_ms() - start) < timeoutMs) {
            int n = uart_read_bytes((uart_port_t)UART_PORT, buf.data(), (uint32_t)buf.size(),
                                    pdMS_TO_TICKS(chunkWaitMs));
            if (n > 0) resp.append((char*)buf.data(), (size_t)n);
        }
        return resp;
    }
};

class Sim800Modem {
public:
    explicit Sim800Modem(Sim800Uart &io) : io_(io) {}

    bool at(const std::string &cmd, const char *expect, int timeoutMs) {
        io_.flushRx();
        ESP_LOGI(TAG, ">> %s", cmd.c_str());
        io_.writeLine(cmd);
        std::string resp = io_.read(timeoutMs);
        ESP_LOGI(TAG, "<< %s", resp.c_str());

        if (resp.find("ERROR") != std::string::npos) return false;
        if (expect == nullptr) return true;
        return resp.find(expect) != std::string::npos;
    }

    bool waitNetworkRegister(int maxWaitMs) {
        int64_t start = now_ms();
        while ((now_ms() - start) < maxWaitMs) {
            io_.flushRx();
            io_.writeLine("AT+CREG?");
            std::string resp = io_.read(1500);
            ESP_LOGI(TAG, "<< %s", resp.c_str());

            // Registered: ,1 (home) or ,5 (roaming)
            if (resp.find(",1") != std::string::npos || resp.find(",5") != std::string::npos) {
                return true;
            }
            vTaskDelay(pdMS_TO_TICKS(1000));
        }
        return false;
    }

    bool initAndRegister() {
        // Basic handshake
        for (int i = 0; i < 5; i++) {
            if (at("AT", "OK", 1000)) break;
            vTaskDelay(pdMS_TO_TICKS(400));
        }

        // SIM ready?
        if (!at("AT+CPIN?", "READY", 2000)) {
            ESP_LOGE(TAG, "SIM not ready. Insert SIM / disable SIM PIN lock.");
            return false;
        }

        // Wait network
        ESP_LOGI(TAG, "Waiting for network registration...");
        if (!waitNetworkRegister(30000)) {
            ESP_LOGE(TAG, "Not registered. Check antenna/signal/power/SIM plan.");
            return false;
        }

        // Optional signal quality
        at("AT+CSQ", "OK", 2000);
        return true;
    }

    bool attachGprs(const char *apn, const char *user, const char *pass) {
        // Reset IP stack
        at("AT+CIPSHUT", "SHUT OK", 8000);
        if (!at("AT+CIPMUX=0", "OK", 2000)) return false;

        // Set APN
        char cstt[160];
        snprintf(cstt, sizeof(cstt), "AT+CSTT=\"%s\",\"%s\",\"%s\"", apn, user, pass);
        if (!at(cstt, "OK", 3000)) return false;

        // Bring up wireless
        if (!at("AT+CIICR", "OK", 12000)) return false;

        // Get IP (often prints just IP without OK)
        io_.flushRx();
        io_.writeLine("AT+CIFSR");
        std::string ip = io_.read(3000);
        ESP_LOGI(TAG, "Local IP: %s", ip.c_str());

        return true;
    }

    bool tcpStart(const char *host, int port) {
        char cmd[220];
        snprintf(cmd, sizeof(cmd), "AT+CIPSTART=\"TCP\",\"%s\",%d", host, port);

        io_.flushRx();
        ESP_LOGI(TAG, ">> %s", cmd);
        io_.writeLine(cmd);
        std::string resp = io_.read(12000);
        ESP_LOGI(TAG, "<< %s", resp.c_str());

        return (resp.find("CONNECT OK") != std::string::npos) ||
               (resp.find("ALREADY CONNECT") != std::string::npos);
    }

    bool tcpClose() {
        // Some firmwares respond OK or CLOSE OK
        return at("AT+CIPCLOSE", "OK", 5000) || at("AT+CIPCLOSE", "CLOSE OK", 5000);
    }

    bool sendHttpPostJson(const char *host, int port, const char *path, const std::string &json,
                          std::string &outResponse) {
        // Build raw HTTP request
        std::string req;
        req.reserve(512 + json.size());

        req += "POST ";
        req += path;
        req += " HTTP/1.1\r\nHost: ";
        req += host;
        // Include port in Host header for non-80 deployments (e.g. :8080)
        if (port != 80 && port > 0) {
            req += ":";
            req += std::to_string(port);
        }
        req += "\r\nContent-Type: application/json\r\nContent-Length: ";
        req += std::to_string((int)json.size());
        req += "\r\nConnection: close\r\n\r\n";
        req += json;

        // Tell SIM800 length
        char cipsend[64];
        snprintf(cipsend, sizeof(cipsend), "AT+CIPSEND=%d", (int)req.size());

        io_.flushRx();
        ESP_LOGI(TAG, ">> %s", cipsend);
        io_.writeLine(cipsend);

        std::string prompt = io_.read(3000);
        ESP_LOGI(TAG, "<< %s", prompt.c_str());
        if (prompt.find(">") == std::string::npos) return false;

        // Send bytes + Ctrl+Z
        io_.writeRaw(req.data(), (int)req.size());
        const char ctrlz = 0x1A;
        io_.writeRaw(&ctrlz, 1);

        // Read server response
        outResponse = io_.read(15000);
        return !outResponse.empty();
    }

private:
    Sim800Uart &io_;
};

static bool responseLooksOk(const std::string &resp) {
    return (resp.find("200 OK") != std::string::npos) ||
           (resp.find("HTTP/1.1 200") != std::string::npos) ||
           (resp.find("\"ok\":true") != std::string::npos) ||
           (resp.find("\"ok\": true") != std::string::npos);
}

extern "C" void app_main(void) {
    Sim800Uart io;
    io.init();
    vTaskDelay(pdMS_TO_TICKS(1000));

    Sim800Modem modem(io);

    if (!modem.initAndRegister()) return;

    ESP_LOGI(TAG, "Attaching GPRS...");
    if (!modem.attachGprs(APN, USER, PASS)) {
        ESP_LOGE(TAG, "GPRS attach failed. Check APN/signal/power.");
        return;
    }

    ESP_LOGI(TAG, "Opening TCP to %s:%d ...", HOST, PORT);
    if (!modem.tcpStart(HOST, PORT)) {
        ESP_LOGE(TAG, "TCP connect failed.");
        return;
    }

    // Example payload (replace later with real sensor values)
    std::string json =
        "{\"deviceId\":\"CTRL01\",\"ts\":1700000000,"
        "\"sensors\":[{\"id\":\"T01\",\"type\":\"temp\",\"v\":31.4},"
        "{\"id\":\"M01\",\"type\":\"motion\",\"v\":1}]}";

    std::string httpResp;
    ESP_LOGI(TAG, "Sending HTTP POST %s ...", PATH);
    if (!modem.sendHttpPostJson(HOST, PORT, PATH, json, httpResp)) {
        ESP_LOGE(TAG, "HTTP send failed.");
        modem.tcpClose();
        return;
    }

    ESP_LOGI(TAG, "HTTP RESPONSE:\n%s", httpResp.c_str());
    modem.tcpClose();

    ESP_LOGI(TAG, "UPLOAD RESULT: %s", responseLooksOk(httpResp) ? "OK" : "FAIL");

    while (true) vTaskDelay(pdMS_TO_TICKS(10000));
}