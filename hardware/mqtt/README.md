# MQTT Broker And Topic Contract

This folder describes the intended MQTT-based device ingress path:

```text
Controller / gateway -> Mosquitto -> mqtt-bridge -> Kafka -> readings-consumer -> PostgreSQL
```

## Topic Contract

Recommended publish topic:

```text
spectron/controllers/<deviceId>/raw
```

Example:

```text
spectron/controllers/CTRL-MOCK-001/raw
```

Reason:
- easy to apply per-device ACL rules
- easy to inspect broker traffic
- bridge can infer `deviceId` from the topic

## Payload Contract

Preferred payload:

```json
{
  "deviceId": "CTRL-MOCK-001",
  "ts": 1700000000,
  "sensors": [
    { "id": "SEN-TH-001", "type": "temp", "v": 31.4 }
  ]
}
```

Also accepted when topic already carries the device ID:

```json
{
  "ts": 1700000000,
  "sensors": [
    { "id": "SEN-TH-001", "type": "temp", "v": 31.4 }
  ]
}
```

Rules:
- `ts` should be Unix seconds from the controller clock
- `sensors[].id` must match the sensor hardware ID
- `sensors[].type` should be a stable sensor type name like `temp`, `humidity`, `motion`
- `sensors[].v` is the numeric reading value
- if both topic and payload contain a device ID, they must match

## Mosquitto Config

Example broker config:
- [mosquitto.conf.example](./mosquitto.conf.example)
- [acl.example](./acl.example)

## Suggested EC2 Layout

- Mosquitto runs on the MQTT EC2 instance
- `mqtt-bridge` runs either:
  - on Elastic Beanstalk as a third process, or
  - on the same EC2 host as Mosquitto and Kafka

For the current repo, the bridge is already wired into the Elastic Beanstalk bundle and is controlled by:

```text
MQTT_BRIDGE_ENABLED=true
```

## Elastic Beanstalk Env Vars For The Bridge

Set these in the EB environment before enabling the bridge:

```text
MQTT_BRIDGE_ENABLED=true
MQTT_BROKER_URL=mqtts://<broker-host>:8883
MQTT_TOPIC=spectron/controllers/+/raw
MQTT_CLIENT_ID=spectron-mqtt-bridge
KAFKA_BROKERS=172.31.13.87:9092
KAFKA_RAW_READINGS_TOPIC=spectron.raw-readings
```

Optional TLS / mTLS:

```text
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_QOS=1
MQTT_CA_FILE=/path/to/ca.pem
MQTT_CLIENT_CERT_FILE=/path/to/client.crt
MQTT_CLIENT_KEY_FILE=/path/to/client.key
MQTT_INSECURE_SKIP_VERIFY=false
```
