# Three-Layer Dashboard Model

## Purpose

This document defines a flexible dashboard design model for Spectron.

The goal is to avoid a rigid sensor-only UI while also avoiding a heavy template system that reduces user freedom.

The recommended direction is:

- keep hardware awareness in the system
- make business meaning and labels use-case driven
- let dashboard presentation be selected separately
- use add-ons and guided defaults instead of forcing hard templates

This approach supports both:

- a standard package with one controller and four supported sensor slots
- a customized paid package with advanced interpretation, derived metrics, and custom dashboard behavior

## Core Problem

A physical sensor type does not automatically decide the best dashboard.

Examples:

- A temperature and humidity sensor for greenhouse monitoring should show climate values and trends.
- An ultrasonic or ToF sensor used for bin level should show fill percentage, not just raw distance.
- The same ultrasonic or ToF sensor used for occupancy should show people count, crowd level, peak periods, or congestion state.
- A load sensor used for shelf monitoring should show load, utilization, and overload risk.

Because of this, the dashboard must not be designed as:

`sensor type -> single fixed widget`

It should be designed as:

`hardware -> interpreted meaning -> presentation`

## Design Principle

Hardware type should decide how data is captured.

Use case should decide:

- what the reading means
- how the value is named
- how alerts are expressed
- how the dashboard is presented

This means labels such as values, warnings, and alerts should be use-case specific rather than sensor specific.

Good examples:

- `Bin Nearly Full`
- `Crowd Level High`
- `Indoor Humidity Above Safe Range`
- `Shelf Load Exceeds Capacity`
- `Air Quality Unsafe`

Weak examples:

- `Ultrasonic Sensor Warning`
- `Temperature Sensor Max Exceeded`
- `Sensor Threshold Triggered`

The first set is meaningful to users.
The second set is technical and sensor-centered.

## The Three Layers

### Layer 1: Physical Sensor Layer

This layer describes the actual hardware connected to the controller.

It answers:

- What sensor is physically installed?
- What is its raw signal?
- What is the hardware capability?

Typical fields:

- sensor hardware type
- sensor hardware ID
- raw unit
- calibration state
- supported raw metrics
- installation position

Examples:

- `temperature_humidity`
- `ultrasonic`
- `tof`
- `load`
- `gas_sensor`

This layer is technical.
It should not directly decide dashboard layout.

### Layer 2: Interpretation or Use-Case Layer

This layer explains what the sensor is being used for.

It answers:

- What does the raw signal represent in this deployment?
- What business meaning should the user see?
- What labels and alert language should be used?

Typical fields:

- use case name
- primary metric name
- derived metric rules
- display unit
- threshold meaning
- alert names
- warning names
- context such as indoor, outdoor, greenhouse, room, bin, shelf, crowd zone

Examples:

- ultrasonic raw distance -> `fill_level_percent`
- ultrasonic raw distance -> `occupancy_count`
- load raw weight -> `utilization_percent`
- temperature/humidity raw values -> `climate_condition`

This layer is the semantic layer.
It is the most important layer for user-facing meaning.

### Layer 3: Presentation Profile Layer

This layer decides how the interpreted information should be shown.

It answers:

- Should the user see a trend graph, a counter, a gauge, a status card, or a timeline?
- Which value is primary?
- Which values are secondary?

Typical fields:

- dashboard profile ID
- primary widget type
- supporting widgets
- chart preference
- summary card style
- alert emphasis
- historical view style

This layer is the UI layer.
It should depend mostly on Layer 2, not directly on Layer 1.

## Why This Is Better Than Hard Templates

Hard templates can make the system feel rigid.

Example problem:

- an ultrasonic sensor is forced into a `fill_level` template even though the user wants occupancy counting

The better model is:

- guided defaults
- editable interpretation
- selectable presentation profile
- optional add-ons for advanced capabilities

This means the system can suggest a good starting point without taking away user freedom.

## Recommended Product Model

### Standard Package

The standard package can support:

- one controller
- up to four sensor slots
- supported physical sensor types
- a fixed set of default presentation profiles
- guided configuration
- basic alerts and charts

This keeps the product simple and easy to support.

### Customized Package

The customized package can unlock:

- custom derived metrics
- custom alert naming
- custom dashboard widgets
- advanced analytics
- industry-specific logic
- special presentation profiles
- branded or domain-specific screens

This makes customization a premium feature without complicating the standard flow.

## Recommended Configuration Flow

The user should not feel like they are filling in three technical layers manually.

The UI should guide them through a simple flow:

1. Select the physical sensor.
2. Define what the sensor is being used for.
3. Choose how the result should be shown.
4. Review labels, thresholds, and alerts.
5. Save and activate.

This is still the three-layer model, but presented in a user-friendly way.

## Recommended Naming Rules

### Values

Displayed values should use the interpreted business label.

Examples:

- `Indoor Temperature`
- `Indoor Humidity`
- `Fill Level`
- `Current Occupancy`
- `Shelf Load`
- `Gas Risk Level`

Avoid displaying only raw hardware labels such as:

- `Ultrasonic Value`
- `Sensor Distance`
- `Generic Sensor Reading`

### Alerts

Alerts should describe operational meaning.

Examples:

- `Bin Nearly Full`
- `Overcrowding Risk`
- `Cold Storage Temperature High`
- `Shelf Overload Risk`
- `Unsafe Gas Concentration`

### Warnings

Warnings should describe action-oriented states.

Examples:

- `Service Soon`
- `Monitor Closely`
- `Ventilation Recommended`
- `Calibrate Sensor`
- `Reading Pattern Abnormal`

## Presentation Profiles

Presentation profiles are not hard business templates.
They are reusable UI behaviors that can be attached after the use case is understood.

### 1. Single Trend Profile

Best for:

- one continuous metric that users want to track over time

Primary widgets:

- current value card
- line chart
- threshold badge

Good examples:

- temperature only
- humidity only
- weight over time
- distance over time for technical diagnostics

Strength:

- simple
- easy to understand
- good for historical monitoring

Weakness:

- not ideal when the main user question is status or count rather than trend

### 2. Dual Climate Profile

Best for:

- temperature and humidity style monitoring

Primary widgets:

- current temperature
- current humidity
- dual trend chart
- comfort or safe-range status

Good examples:

- greenhouse monitoring
- room climate monitoring
- cold storage monitoring

Strength:

- matches how climate is naturally interpreted

Weakness:

- requires multi-metric support rather than a single scalar reading

### 3. Level Monitoring Profile

Best for:

- fill level, tank level, storage level, bin level

Primary widgets:

- fill percentage gauge
- current level status
- trend chart as secondary
- days-to-full estimate if available

Good examples:

- bin monitoring
- water tank monitoring
- material container monitoring

Strength:

- business-friendly
- avoids showing raw distance as the main UI

Weakness:

- needs interpretation logic from raw distance to useful level meaning

### 4. Occupancy Counter Profile

Best for:

- people counting
- crowd monitoring
- zone occupancy

Primary widgets:

- current count
- peak count today
- hourly activity bars or heatmap
- crowd state badge

Good examples:

- room occupancy
- queue density
- crowd estimation

Strength:

- matches the real question users ask

Weakness:

- a raw distance graph is not enough here
- usually needs event or counting logic, not just raw sensor trends

### 5. Utilization and Load Profile

Best for:

- load cells
- shelf capacity monitoring
- equipment usage weight monitoring

Primary widgets:

- current load
- utilization percentage
- overload status
- recent trend

Good examples:

- shelf weight monitoring
- container load monitoring
- equipment capacity tracking

Strength:

- practical for operational decisions

Weakness:

- simple raw charts are not enough without capacity context

### 6. Safety Gauge Profile

Best for:

- gas monitoring
- air quality monitoring
- risk score dashboards

Primary widgets:

- risk gauge
- safe or warning badge
- recent incident timeline
- threshold state

Good examples:

- gas leak risk
- air quality risk
- dangerous environment detection

Strength:

- strong safety-first communication

Weakness:

- should emphasize status and action, not only trend graphs

### 7. Event Timeline Profile

Best for:

- systems where changes, spikes, or incidents matter more than constant line charts

Primary widgets:

- event list
- alert timeline
- state changes
- incident count

Good examples:

- threshold crossings
- safety incidents
- occupancy spikes

Strength:

- highlights operational events clearly

Weakness:

- not ideal when users mainly need continuous metric tracking

### 8. Hybrid Operational Profile

Best for:

- advanced or customized dashboards
- systems needing both summary KPIs and historical charts

Primary widgets:

- KPI cards
- one key chart
- one status panel
- one alert section

Good examples:

- paid customized deployments
- enterprise dashboards
- mixed monitoring systems

Strength:

- flexible and powerful

Weakness:

- should be used carefully to avoid heavy interfaces in the standard package

## Example Mappings

### Example A: Temperature and Humidity Sensor in Greenhouse

Layer 1:

- physical sensor type: `temperature_humidity`

Layer 2:

- use case: `climate monitoring`
- labels: `Temperature`, `Humidity`
- alerts: `High Temperature`, `Low Humidity`

Layer 3:

- presentation profile: `Dual Climate Profile`

Main dashboard:

- current temperature
- current humidity
- dual trend graph
- greenhouse comfort or safe state

### Example B: Ultrasonic Sensor for Smart Bin

Layer 1:

- physical sensor type: `ultrasonic`
- raw metric: distance in cm

Layer 2:

- use case: `fill level monitoring`
- derived metric: `fill level %`
- alerts: `Bin Nearly Full`, `Overflow Risk`

Layer 3:

- presentation profile: `Level Monitoring Profile`

Main dashboard:

- fill percentage gauge
- current status
- small trend graph
- estimated service need

### Example C: Ultrasonic or ToF Sensor for Crowd Counting

Layer 1:

- physical sensor type: `ultrasonic` or `tof`

Layer 2:

- use case: `occupancy counting`
- derived metric: `current occupancy`
- alerts: `Crowd Level High`, `Overcrowding Risk`

Layer 3:

- presentation profile: `Occupancy Counter Profile`

Main dashboard:

- current count
- peak count
- activity bars
- status badge

The main screen should not be a raw distance line chart.

### Example D: Load Sensor for Shelf Monitoring

Layer 1:

- physical sensor type: `load`

Layer 2:

- use case: `weight utilization`
- derived metric: `capacity used %`
- alerts: `Shelf Overload`, `Restock Soon`

Layer 3:

- presentation profile: `Utilization and Load Profile`

Main dashboard:

- current load
- capacity percentage
- overload indicator
- trend chart

### Example E: Gas Sensor for Safety Monitoring

Layer 1:

- physical sensor type: `gas_sensor`

Layer 2:

- use case: `gas safety`
- derived metric: `risk level`
- alerts: `Unsafe Gas Concentration`

Layer 3:

- presentation profile: `Safety Gauge Profile`

Main dashboard:

- risk gauge
- safety badge
- incident timeline
- recent trend as secondary

## Role of Add-Ons

Add-ons are the preferred way to grow the product without making the base system rigid.

Examples of add-ons:

- occupancy analytics add-on
- fill-level analytics add-on
- advanced reporting add-on
- custom widgets add-on
- domain-specific alert packs
- AI interpretation add-on

This is better than forcing all users into many heavy built-in templates.

## Recommended Rule for Spectron

Use this decision rule:

- hardware type defines what can be measured
- use case defines what the reading means
- presentation profile defines how the dashboard looks

This keeps the system flexible, scalable, and commercially clean.

## Implementation Direction

The implementation should move toward:

1. sensor hardware type stored separately
2. use-case configuration stored separately
3. presentation profile stored separately
4. user-facing names, alerts, and warnings generated from the use case layer
5. raw graph kept as a secondary technical view when needed

This avoids overloading the main dashboard with sensor-centric technical detail while still preserving raw data for diagnostics.

## Final Recommendation

Do not make Spectron only a sensor dashboard.

Make Spectron a use-case-driven monitoring platform where:

- sensors are the hardware layer
- meaning comes from interpretation
- value comes from presentation and action

That gives the standard package a clean, guided experience and leaves room for custom paid add-ons without forcing the whole product into rigid templates.
