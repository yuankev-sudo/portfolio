# Original Project Content Archive

Full, unabridged text of every project as it appeared in `projects.json` before the 2026-08-28 pass that condensed the project pages for skim-readability.

Nothing here is live on the site. Kept so the long-form detail (design-review findings, stackup decisions, RF reasoning, architecture notes) isn't lost — useful for interviews, grad applications, or a future "deep dive" toggle on the project pages.

---

## 01 — Imitation Learning Tool

- **id:** `imitation-learning-controller`
- **Category:** Electrical
- **Date:** Aug 2025
- **Role / Timeline / Team:** Embedded Systems Intern · 3 months · Solo
- **Tags:** RP2040, KiCad, ROS Serial, Squareline Studio
- **Tech tags:** KiCad, RP2040, ROS Noetic, C#, Squareline Studio

**Subtitle**

> Design, fabricate and program a PCB to control and power an imitation learning data collecting tool

**Card description**

> Multi-interface platform with custom PCB design. Low-power RP2040 implementation featuring ROS Serial and custom interactive UI.

### Overview

*(section type: overview)*

During a summer internship at Nupeak Robotics after my freshman year, I designed and built a fully integrated robot training tool from the ground up — despite having no prior embedded systems experience. Over three months, I developed hands-on expertise in PCB design, UI integration, and firmware programming, ultimately delivering a ROS-enabled platform now used by the company to collect imitation learning data for training robot arms.

### Gallery (side-by-side)

- `images/Nupeak/NupeakV1.png` (image) — V1 — designed from scratch in KiCad. Migrated to the RP2350B, added a BLDC motor controller, TFT display, and tactile buttons, with stepped-down power rails (12V → 3.3V / 5V).

### Problem & Constraints

*(section type: problem)*

Following design reviews with the CTO and senior engineers, several critical areas for improvement were identified in V1. Signal integrity issues in the routing risked unreliable communication between the microcontroller and peripherals. EMI noise posed a threat to sensor accuracy and overall system stability. Physical space constraints made efficient component placement and trace routing a significant challenge, while power line losses threatened to reduce the efficiency of the stepped-down rails. Balancing all four concerns simultaneously — without compromising the board's compact form factor or timeline — became the central challenge of the next iteration.

### V2 — Layout Refinement

*(section type: overview)*

V2 was a focused response to the issues surfaced in design review. The overall board size was reduced through more strategic placement of connectors and decoupling capacitors, and the mounting points were trimmed from four to three to avoid over-constraining the mechanical assembly. Signal integrity saw significant improvement: minimal traces run beneath or parallel to the USB differential pair, the motor driver power and signal return paths are separated from noise-sensitive elements, higher-power rails were widened to reduce energy loss, and perpendicular layer crossings were adopted to minimize EMI and crosstalk. The stackup follows the conventional 4-layer SGPS arrangement.

### Gallery (side-by-side)

- `images/Nupeak/NupeakV2.png` (image) — V2.0 — refined layout addressing the signal integrity and space constraints from design review.

### V3 — Key Technical Decisions

*(section type: overview)*

The most significant change in V3 was switching from a linear regulator to a buck converter to accommodate the increased power budget from the BLDC motor. This required more intentional component placement with return paths in mind — inductors and the converter were placed along the board edge to minimize noise. Solder jumpers were introduced as a flexible way to reassign GPIO functionality without board respins, since the peripheral count was pushing the pin budget. A haptics element (LRA + driver) was also added for a more customizable user experience. The layer stackup was refined: signal traces are confined to the top and bottom layers, with complete ground and power pours in the middle. The top pour is reserved for the high-power 12V rail only, top-layer traces run perpendicular to the bottom layer, and no signal line runs below the differential USB pair.

### Gallery (side-by-side)

- `images/Nupeak/NupeakV3.png` (image) — V3.0 — final revision with buck converter, solder jumpers, haptics, and refined 4-layer stackup.

### Gallery (grid-3)

- `images/Nupeak/Screen.png` (image) — Power supply circuit with voltage regulation
- `images/Nupeak/NupeakDPad.png` (image) — Microcontroller circuit with peripheral connections
- `images/Nupeak/NupeakTrig.png` (image) — Sensor interface circuits and signal conditioning

### Full-width image

- `images/Nupeak/IMG_1456.jpeg` — Fully assembled and tested PCB ready for integration

### Firmware & UI

*(section type: overview)*

Alongside the hardware iterations, the firmware and user interface were developed in parallel. The RP2350B's dual cores were partitioned by responsibility: Core 0 handles the ROS Serial communication layer, running custom service-client nodes that expose the device's actuators and sensors to the broader ROS Noetic pipeline, while Core 1 is dedicated to the UI — driving the SquareLine Studio-designed TFT interface (built on the LVGL graphics library) for real-time monitoring and interactive control. This split keeps latency-sensitive I/O and serial communication isolated from the rendering loop, ensuring neither task blocks the other.

### Gallery (grid-2)

- `images/Nupeak/SquarelineUIV1.png` (image) — V1.0 UI Design with limited features
- `images/Nupeak/SquarelineUIV2.png` (image) — V2.0 Interactive UI over ROS, including battery level, tracking status, recording count, etc

### Results & Impact

*(section type: results)*

| Value | Label |
|---|---|
| 20s | Time saved per recording |
| 100% | PCBs' Functional Rate |
| 7 | Additional Features |

### Gallery (grid-2)

- `images/Nupeak/Arduino.png` (image) — Testing environment with measurement equipment
- `images/Nupeak/Imitation Learning Controller.png` (image) — Complete system integrated into the imitation learning platform

### Additional Images

*(section type: overview)*

### Gallery (grid-3)

- `images/Nupeak/NupeakInject.png` (image) — CAN + PWR Injector Board
- `images/Nupeak/fab.jpeg` (image) — Fabricating PCBs using Stencile
- `images/Nupeak/fab2.jpeg` (image) — Finished Assembled LED PCBs
- `images/Nupeak/test.jpeg` (image) — Testing LED RGB Command
- `images/Nupeak/mov1.MOV` (video) — Testing LVGL Graphics Export
- `images/Nupeak/mov2.MOV` (video) — Testing ROS Serial

---

## 02 — System-on-Module

- **id:** `system-on-module`
- **Category:** Electrical
- **Date:** Dec 2025
- **Role / Timeline / Team:** Hardware Engineer · 2 months · 3
- **Tags:** RP2350B, KiCad
- **Tech tags:** RP2350B, KiCad

**Subtitle**

> System-on-Module for local motor control for quadruped project

**Card description**

> Compact motor control module using RP2350B for distributed actuation in quadruped robotics. Custom castellated edge design for board-to-board stacking with optimized signal integrity.

### Overview

*(section type: overview)*

Built a compact System-on-Module to control individual joint actuators in a quadruped robot. Each leg needed its own local controller to handle motor commands without overwhelming the main processor, so I designed this board around the RP2350B to sit right next to each actuator. Getting clean signals in an environment full of motor noise took several iterations, but the final design handles the electrical chaos of PWM motor drivers while keeping communication rock-solid.

### Gallery (side-by-side)

- `images/Atombot/v1.png` (image) — V1 — Initial SoM design with RP2350B, external crystal, and flash memory for program storage.

### Problem & Constraints

*(section type: problem)*

Twelve motors switching at high frequencies creates an electrical nightmare. The SoM had to fit in tight spaces near each joint while dealing with all that noise, plus handle high-speed communication between modules without dropping data. The mechanical team needed castellated edges for board-to-board stacking to save space. The approach was to keep the module dead simple — just the brain (RP2350B), its clock, and flash memory. All the power and motor control stuff stays on the main board. So the real challenge was keeping differential signals clean, making sure the crystal circuit was stable, and designing custom castellated edges that could handle repeated assembly cycles.

### Technical Approach

*(section type: overview)*

Signal integrity was the main battle here. I routed all high-speed differential pairs with matched lengths and controlled impedance — if the timing's off even slightly, you get data corruption. Scattered vias everywhere for ground plane stitching to give return currents a clean path back and cut down on EMI. Kept power and ground planes separate so digital noise wouldn't couple into anything sensitive. The castellated edges were initially through hole pin headers, but in V2 I decided to design a custom one since I couldn't find a footprint that worked for our stacking scheme. The design is intentionally minimal — just the RP2350B, a crystal for stable clocking, and external flash for program storage. Everything else (power regulation, motor drivers) lives on the main board that this module plugs into.

### Gallery (grid-2)

- `images/Atombot/v1.1.png` (image) — V2 — Added castellated edges for board-to-board stacking
- `images/Atombot/v2.png` (image) — V3 — Design with optimized signal integrity and custom castellated footprint

### Results & Impact

*(section type: results)*

| Value | Label |
|---|---|
| 4 | Design Iterations |
| 4 | Modules Per Robot |
| 100% | First Assembly Success |

### Gallery (side-by-side)

- `images/Atombot/v3.png` (image) — Final SoM board with improved component orientation and castellated edges

---

## 03 — D-Stock Racing Telemetry System

- **id:** `d-stock-telemetry`
- **Category:** Electrical
- **Date:** Mar 2026
- **Role / Timeline / Team:** Computing Hardware Lead · 5 months · 3
- **Tags:** STM32F4, Rigid-Flex PCB, Altium, Iso CAN
- **Tech tags:** Altium Designer, STM32F4, Iso CAN, Antenna, SD Card

**Subtitle**

> Led cockpit board design and contributed to telemetry system for high-speed marine racing application

**Card description**

> Led cockpit board design in Altium using STM32F4 for high-speed D-Stock boat racing. Rigid-flex PCB with multi-rail power management (48V-3.3V) and complete HV/LV isolation. Contributed to telemetry board with GPS and CAN bus.

### Overview

*(section type: overview)*

Led the complete design of the cockpit board and contributed to the telemetry board for high-speed D-Stock boat racing applications. The cockpit system features a rigid-flex PCB with multi-rail power management (48V to 3.3V), while the telemetry board provides GPS tracking and CAN bus communication. Through three design iterations on the cockpit board, the system evolved from a basic two-board design to a highly integrated rigid-flex solution with complete high-voltage/low-voltage isolation and enhanced signal integrity.

### Problem & Constraints

*(section type: problem)*

High-speed boat racing demands extreme reliability in harsh conditions including constant vibration, water exposure, and electrical noise from high-power motors. The cockpit system needed to manage 48V high-voltage inputs while providing clean 3.3V logic signals, all within a compact form factor that could withstand mechanical shock. Signal integrity was critical for GPS antenna routing and CAN bus communication, while the design had to maintain complete electrical isolation between high-voltage and low-voltage circuits to ensure safety and prevent ground loops.

### Technical Approach & Design Evolution

*(section type: technical)*

The project evolved through three major iterations, each addressing specific challenges discovered through testing and real-world operation. Starting with a basic two-layer design, the system progressively improved in reliability, signal integrity, and manufacturing robustness.

#### V1: Foundation Design

The initial design established the core architecture with SD card logging using pull-up resistors for SPI communication, M12 connectors for high reliability and voltage rating in marine environments, comprehensive test points for debugging, CAN transceiver with basic signal integrity measures, fundamental HV/LV separation on the same board, DPDT relay for HV contactor control, backup SPDTs for digital switching redundancy, and Boot option paired with RST button for programming flexibility.

### Gallery (grid-2)

- `images/UMEB/v1.png` (image) — V1: Initial two-layer design with basic HV/LV separation, M12 connectors, and DPDT relay for HV contactor control
- `images/UMEB/v1a.jpg` (image) — V2 assembled and tested in lab environment

### V2: Signal Integrity & Separation

*(section type: technical)*

#### Key Improvements

Version 2 introduced significant improvements including SD card buffer for enhanced signal integrity and drive strength, external resistor for crystal oscillator to limit current and improve stability, complete HV/LV separation using stacked boards for superior isolation and better size constraints, FFC (Flexible Flat Cable) connectors for inter-board communication, simplified programming interface with SWD and Boot0 elimination (RST button only), and buffered SD card signals for improved reliability at higher speeds.

### Gallery (grid-2)

- `images/UMEB/v2.png` (image) — V2: Stacked board architecture with FFC connector for complete HV/LV separation
- `images/UMEB/v2t.png` (image) — V2 assembled and tested in lab environment

### V3: Rigid-Flex Integration

*(section type: technical)*

#### Final Design Achievements

The final iteration achieved professional-grade reliability through rigid-flex PCB construction eliminating two failure points from connectors while providing superior vibration resistance, complete galvanic isolation between HV and LV sections, 40% more compact footprint, enhanced CAN signal integrity through controlled impedance routing and proper termination, strategic ground plane cutouts under switching regulators to reduce EMI, backup SD card pin header for external reading during diagnostics, and BJT-based LED drivers to protect GPIO pins from overcurrent conditions.

### Gallery (grid-3)

- `images/UMEB/iso-cock.png` (image) — 3D model showing rigid-flex construction with integrated HV/LV isolation
- `images/UMEB/view1.png` (image) — V3 final production board with rigid-flex PCB - 40% more compact than V2
- `images/UMEB/view2.png` (image) — V3 final production board with rigid-flex PCB - 40% more compact than V2

### Telemetry Board Design

*(section type: technical)*

Collaborated on the telemetry board design, which required precise RF engineering for GPS functionality and robust industrial communication protocols. Contributed to critical signal integrity decisions for the RF and communication subsystems.

#### GPS Antenna Routing

Assisted in implementing controlled impedance routing (50Ω) for the GPS antenna trace using microstrip line calculations. The trace geometry was carefully calculated to maintain characteristic impedance matching between the GPS module and antenna connector, minimizing signal reflections and maximizing sensitivity. Load termination was added at the antenna end to prevent standing waves.

### CAN Bus Signal Integrity

*(section type: technical)*

#### Robust Communication Design

Contributed to the design of differential CAN bus traces with impedance matching (120Ω differential) and optocoupler isolation to protect the microcontroller from ground potential differences and electrical transients. Strategic component placement kept CANL/CANH traces away from noisy switching power supplies and other interference sources. Bus termination with 120Ω resistor ensured proper signal integrity.

### Gallery (side-by-side)

- `images/UMEB/telem.png` (image) — Telemetry board featuring GPS module with impedance-matched antenna trace and optocoupled CAN bus interface

### Results & Key Improvements

*(section type: results)*

Through three design iterations, the system achieved production-ready reliability for demanding racing environments. Each version addressed specific failure modes and performance limitations discovered through rigorous testing.

| Value | Label |
|---|---|
| 3 | Design iterations |
| 40% | Size reduction (V3) |
| 10+ | End users satisfied |

### Key Learnings

*(section type: learnings)*

This project reinforced the importance of iterative design in high-reliability applications. The transition from V1 to V2 taught me that physical separation of HV/LV circuits provides far better isolation than simple PCB layout techniques. Moving to rigid-flex in V3 demonstrated that investing in advanced manufacturing processes can eliminate entire categories of failure modes - the cost of rigid-flex was justified by removing connector failures in high-vibration environments. RF design requires meticulous attention to transmission line theory; the GPS antenna routing showed that even small impedance mismatches significantly degrade performance. Finally, strategic ground plane management around switching regulators proved essential for EMI reduction - the cutouts under inductors reduced radiated emissions measurably. If given more time, I would implement a fourth iteration with integrated power monitoring on each rail and add redundant SD card storage with automatic failover for critical race data logging.

### To Be Continued...

*(section type: overview)*

The project is currently in the assembly and enclosure design phase. I'm designing a custom case to house the rigid-flex cockpit board and telemetry system, ensuring proper mechanical protection while maintaining access for debugging and field servicing. PCB assembly is underway with careful attention to component placement and soldering quality for the rigid-flex construction. Stay tuned for updates on the final integrated system and on-water testing results.

---

## 04 — Supercapacitor Power Module

- **id:** `supercapacitor-power-module`
- **Category:** Electrical
- **Date:** In Progress
- **Role / Timeline / Team:** Captain & Co-founder · Ongoing · Team
- **Tags:** Supercapacitors, Power Electronics, KiCad, C++
- **Tech tags:** KiCad, Supercapacitors, Power Electronics, C++

**Subtitle**

> Smart power assist module for a high-agility infantry robot, developed under Michigan Advanced Robotics Competition

**Card description**

> Supercapacitor-based power module providing burst energy delivery for rapid maneuvers in competitive robotics. Designed for high peak current demand with smart charge/discharge control.

### Overview

*(section type: overview)*

As captain and co-founder of Michigan Advanced Robotics Competition (MARC), I'm leading the development of a Supercapacitor Power Module designed to provide intelligent burst power assist for a high-agility infantry robot. Infantry robots demand extreme power in short windows — hard acceleration, rapid direction changes, and aggressive maneuvers all create peak current draws that a battery alone handles poorly. The module sits between the battery and drive system, absorbing charge during low-demand phases and dumping it during peak loads to keep the robot fast and responsive without stressing the primary power source.

### Problem & Constraints

*(section type: problem)*

Lithium batteries are energy-dense but have limited peak current capability — pushing them hard accelerates degradation and causes voltage sag that slows the robot at the worst possible moment. A competitive infantry robot needs repeatable, high-current bursts throughout a match without thermal runaway or brownouts. The module had to be compact enough to fit within the robot's weight and space budget, integrate cleanly with the existing power architecture, and be robust enough to survive the mechanical shock of combat.

### Gallery (grid-3)

- `images/MARC/SuperCap v1 layout.png` (image) — Fused + Regulated Input (Slow start to prevent inrush current @ high dV), Super Cap Array health monitor and regulated output. STM32 controlled MOSFETs for reverse current blocking
- `images/MARC/super_capacitor.png` (image) — V1 SuperCap Board 3D view
- `images/MARC/SuperCap v1 assembled.png` (image) — V1 SuperCap Final Assembled

### Technical Approach

*(section type: overview)*

Supercapacitors (ultracapacitors) are the right tool here — they can charge and discharge orders of magnitude faster than batteries and tolerate far more charge cycles. The module uses a bank of supercapacitors managed by a bidirectional DC-DC converter, which controls when energy flows in and out based on bus voltage and current demand. A microcontroller monitors system state and governs the charge/discharge logic, ensuring the caps are primed before high-demand events and protected from overvoltage. Balancing circuits keep individual cell voltages even across the bank to prevent premature cell degradation.

### Status

*(section type: results)*

Project is currently in active testing and development.

| Value | Label |
|---|---|
| $12K+ | Funding raised |
| 10+ | Members recruited |
| TBD | Success? |

---

## 05 — Clarus

- **id:** `clearpath`
- **Category:** Software
- **Date:** June 2026
- **Role / Timeline / Team:** Full-Stack Developer · 6 hours · Solo
- **GitHub:** https://github.com/yuankev-sudo/CYVL-Hackathon
- **Tags:** Python, FastAPI, Leaflet.js, Autodesk APS, CYVL
- **Tech tags:** Python, FastAPI, Shapely, Leaflet.js, Autodesk APS, CYVL LiDAR

**Subtitle**

> Profile-aware routing for large vehicles, built on measured LiDAR pavement reality — not a restriction database

**Card description**

> 2nd place ($3,000) out of 12 teams at the CYVL Hackathon. 6-hour MVP routing large vehicles through Somerville, MA using CYVL LiDAR data. Per-turn swept-path feasibility checks block physically impossible turns and reroute automatically.

### Overview

*(section type: overview)*

Built Clarus at the CYVL Hackathon in 6 hours — a routing tool that solves a problem existing truck routers (Google Maps, Waze, Route4Me) fundamentally can't: they route off reported restriction databases, not measured road reality. Clarus routes off CYVL LiDAR data for Somerville, MA, checking per-turn swept-path feasibility against real intersection geometry and LiDAR-derived obstacles like trees and utility poles. A fire truck that physically can't clear a tight corner gets flagged and rerouted — before it gets there.

### Gallery (grid-3)

- `images/CYVL-Hack/Main Web Page.png` (image) — Clarus UI — three routing profiles with live comparison. Orange markers flag tight/fail intersections along the Large Vehicle route.
- `images/CYVL-Hack/Lidar Demo Segment.png` (image) — Route segment showing a 7.25 m measured overhead clearance from CYVL LiDAR data.
- `images/CYVL-Hack/Lidar Point Cloud .png` (image) — LiDAR point cloud of the Mystic Ave viaduct — 7.25 m measured clearance, all four AASHTO design vehicles pass.

### Video — Demo

- YouTube: CS9W8MGKsOE — Live demo — routing a fire truck through Somerville, MA. The Large Vehicle profile detects a failing intersection, flags it with an orange marker, and automatically reroutes.

### Problem & Constraints

*(section type: problem)*

Large vehicle routing is a solved problem only on paper. Existing tools rely on manually-maintained restriction databases — wrong lane widths, missing turn restrictions, no awareness of encroaching objects. The result: GPS systems confidently route ambulances down roads with poor pavement (critical for patient comfort) or send a fire ladder truck into a turn its body can't physically clear. The core challenge was building a turn feasibility check from first principles — no off-the-shelf tool exists that computes whether a specific vehicle's swept path fits a specific intersection's real geometry. Everything had to be derived: turning radii from AASHTO vehicle dimensions, road width estimates from centerline data, obstacle clearance from above-ground asset positions.

### Architecture

*(section type: technical)*

The system has four distinct layers, each independently runnable as a demo.

#### Road Graph (routing/cyvl_graph.py)

Built a weighted directed graph from CYVL Somerville centerline shapefiles — 1,535 nodes, 2,160 edges, with 890 segments spatially joined to PCI pavement scores via nearest-midpoint matching. Dijkstra runs with three modes: pure distance (Fastest), PCI penalty factor (Smoothest/ambulance), and blocked intersection sets (Large Vehicle). The graph builds once on startup and is cached for the process lifetime.

#### Turn Feasibility (routing/cyvl_graph.py + geometry/turning.py)

For each intersection node (degree ≥ 3) along the naive route, the system computes the turn deviation angle using correctly oriented polyline vectors, estimates available turning radius from road width and turn angle geometry, then compares it to the vehicle's required outer swing radius. LiDAR above-ground assets (trees, utility poles) can further reduce usable corner radius. Output per intersection: pass / tight / fail with a plain-English explanation of the constraint — road widths, margin in feet, nearest obstacle.

#### Routing Profiles

Three profiles share the same Dijkstra core. Fastest minimizes distance only. Smoothest adds a PCI penalty factor (configurable metres per PCI point below 100), routing ambulances around rough pavement. Large Vehicle runs a pre-pass on the naive route to identify FAIL intersections, blocks them as impassable nodes, then rereroutes — the before/after comparison is the core demo.

#### Autodesk APS Integration

Integrated Autodesk Platform Services as an optional swept-path backend (sweptpath/autodesk_backend.py), with a Shapely geometric fallback (sweptpath/shapely_backend.py) that stays fully functional end-to-end at all times. The fallback uses vehicle dimensions from AASHTO design standards (WB-67 tractor-trailer, SU-30 single-unit truck, fire ladder, 40ft transit bus) to compute outer swing radii directly.

### Results

*(section type: results)*

| Value | Label |
|---|---|
| 2nd / 12 | Hackathon placement |
| $3,000 | Prize won |
| 6 hrs | End-to-end build time |

### Key Learnings

*(section type: learnings)*

The biggest insight was how much a restriction-database approach misses. Pavement condition and physical turn geometry are both properties that must be measured — they can't be crowd-sourced or inferred from map data alone. CYVL's LiDAR pipeline is the rare case where the underlying data quality actually enables a new class of routing decisions. The turn feasibility geometry was the hardest part to get right: correctly orienting both entry and exit polyline vectors relative to the intersection node required careful attention to direction, and small bugs produced nonsensical turn angles. The APS integration also showed a real pattern for layered backends — having the Shapely fallback as a guaranteed-working baseline let development proceed without ever being blocked on API availability.

---

