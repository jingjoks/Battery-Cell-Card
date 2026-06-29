/**
 * Battery Cell Card
 * A Home Assistant Lovelace custom card for visualizing BMS
 * (Battery Management System) data — pack voltage/current,
 * SOC/capacity, temperatures with 6h sparkline trends, a center
 * SoC visual (2 styles selectable via `center_style`: a literal
 * horizontal battery-shape icon, or a 270° arc gauge) flanked by
 * Grid/Solar and Load flow icons connected to the gauge with dashed
 * lines that light up + show live wattage whenever that side is
 * active, a status row with up to three chips (Charge/Discharge/
 * Balance), an optional header info bar (capacity, HW/SW version,
 * uptime), and a per-cell voltage display (horizontal list, or a
 * per-cell vertical battery-shape icon) with optional resistance,
 * automatic highlighting of the highest / lowest cells.
 *
 * *** ใหม่ใน v1.4.0 ***
 * - `center_style` เพิ่ม 2 ตัวเลือกใหม่: `arc` (มาตรวัดโค้ง 270° พร้อมขีดสเกล,
 *   เข็มชี้ปลายแถบ, แสงเรือง, ไล่สีอัตโนมัติตาม SOC) และ `battery-shape`
 *   (ทรงแบตเตอรี่แนวนอนพร้อมปุ่มขั้ว, ไล่เฉดสี, เส้นแบ่งช่อง, ผิวเงา)
 * - ไอคอน Grid/Solar (ซ้าย) และ Load (ขวา) เชื่อมกับมาตรวัดกลางด้วยเส้นประ
 *   ที่จะติดสีเมื่อมีการไหลของพลังงานฝั่งนั้น พร้อมโชว์ "Charge: ON/OFF",
 *   "Discharge: ON/OFF" และวัตต์ (จาก entity `power` ตัวเดิม ไม่ต้องเพิ่ม entity)
 * - กล่องสถานะ Charge/Discharge แยกด้านล่างถูกรวมเข้ากับไอคอนซ้าย-ขวาแล้ว
 *   (เหลือแค่ Balance ที่ยังโชว์เป็นกล่องแยกถ้าตั้ง entity ไว้)
 * - มาตรวัด `arc` โชว์ค่าในวงกลม 3 บรรทัด: SOC ตัวใหญ่ + แรงดัน/กระแสตัวเล็กกว่า
 * - ทุกอย่างใช้ entity เดิมที่มีอยู่แล้วทั้งหมด (soc, power, current,
 *   charge_status, discharge_status) ไม่ต้องเพิ่ม entity ใหม่ — ไม่ตั้งค่า
 *   `center_style` ก็ใช้งานแบบเดิม (`battery`) ไม่กระทบของเดิม
 *
 * *** แก้ไขใน v1.4.1 ***
 * - แก้บั๊กไอคอน Grid/Solar (Charge) และ Load (Discharge) ติด "ON" พร้อมกันทั้ง
 *   สองฝั่ง เมื่อ entity `charge_status`/`discharge_status` รายงานค้างขัดแย้งกัน
 *   เอง (เป็นไปไม่ได้ในทางไฟฟ้าจริง) — ตอนนี้ถ้า entity ทั้งสองรายงาน ON พร้อมกัน
 *   จะใช้ทิศทางจากค่า `current` ที่วัดได้จริงเป็นตัวชี้ขาดแทน
 * - กราฟแท่ง cell voltage (thermometer bars): ตั้งจำนวนแท่งต่อแถวผ่าน inline
 *   style ตรงจาก JS เพิ่มเติม (ไม่พึ่ง CSS custom property ภายใน `repeat()`
 *   อย่างเดียว) เพื่อให้จำนวนแท่งต่อแถวตรงกับค่า `bar_columns` ที่ตั้งไว้แน่นอน
 *   ในทุกเบราว์เซอร์/แอป companion
 *
 * *** ใหม่ใน v1.5.0 ***
 * - แถวสถานะกลาง (ใต้มาตรวัด SoC) กลับมาโชว์ Charge/Discharge chip ได้อีกครั้ง
 *   ควบคู่กับ Balance (ถ้าตั้ง entity `charge_status`/`discharge_status` ไว้)
 *   โดยใช้ค่าเดียวกับที่ไอคอน flow ซ้าย-ขวาใช้ ไม่ขัดแย้งกันเอง — ใครไม่ตั้ง
 *   entity ไหนไว้ chip นั้นก็ไม่โชว์เหมือนเดิม ไม่บังคับ
 * - `cell_list_style` เพิ่มตัวเลือกที่ 3: `battery` — เซลล์แต่ละเซลล์แสดงเป็น
 *   ไอคอนแบตเตอรี่แนวตั้ง (มีปุ่มขั้วบนตัว, เส้นแบ่งช่อง 3 เส้น, ผิวเงาด้านซ้าย)
 *   พร้อมค่าแรงดันและความต้านทานอยู่*ภายใน*ตัวไอคอนเลย แทนการโชว์เป็นตัวเลข
 *   แยกข้างนอกแบบ thermometer bars — สี fill (เขียว/เหลือง/แดง) ยังคำนวณจาก
 *   `cell_min_voltage`/`cell_max_voltage` เหมือนเดิม ส่วนขอบไอคอนจะเป็นสีฟ้า/แดง
 *   เมื่อเป็นเซลล์สูงสุด/ต่ำสุดของแพ็ก (`bars`/`list` เดิมยังเลือกใช้ได้ตามปกติ)
 *
 * *** ใหม่ใน v2.0.0 (BREAKING) ***
 * - ตัดตัวเลือก center_style `ring` และ `battery` (แนวนอน) ออก — เหลือแค่ 2 แบบ:
 *   `battery-shape` (ตอนนี้เป็น default) และ `arc`. ใครตั้ง config เป็น `ring`
 *   หรือ `battery` ไว้ จะ fallback ไปเป็น `battery-shape` อัตโนมัติ (ไม่ error
 *   แต่หน้าตาจะเปลี่ยน เพราะ 2 แบบนี้ถูกลบออกจากโค้ดจริงแล้ว ไม่ใช่แค่ซ่อน)
 * - ตัดตัวเลือก cell_list_style `bars` (thermometer bars แนวตั้งแบบเดิม) ออก —
 *   เหลือแค่ 2 แบบ: `list` และ `battery` (ตอนนี้เป็น default). ใครตั้ง `bars`
 *   ไว้จะ fallback ไปเป็น `battery` อัตโนมัติ เช่นเดียวกัน
 *
 * Originally built for JK-BMS but works with any integration that
 * exposes the right sensor entities (ESPHome jk-bms component,
 * JK-BMS BLE custom component, MQTT, Victron, Daly, Seplos, etc.) —
 * just point the `entities` config at your own entity IDs.
 */

const CARD_VERSION = "2.0.0";

console.info(
  `%c JK-BMS-CARD %c v${CARD_VERSION} `,
  "color: #0b1620; background: #4ade80; font-weight: 700; border-radius: 3px 0 0 3px; padding: 2px 0 2px 6px;",
  "color: #4ade80; background: #14202b; font-weight: 700; border-radius: 0 3px 3px 0; padding: 2px 6px 2px 0;"
);

const STRINGS = {
  th: {
    toggleTh: "ไทย",
    toggleEn: "English",
    packPower: "กำลังแบต",
    avgCell: "เซลล์เฉลี่ย",
    deltaCell: "ผลต่างเซลล์",
    temp1: "อุณหภูมิ T1",
    temp2: "อุณหภูมิ T2",
    mosTemp: "อุณหภูมิ MOS",
    soc: "SOC",
    remainCap: "ความจุคงเหลือ",
    totalCap: "ความจุทั้งหมด",
    soh: "SOH",
    cycles: "รอบการชาร์จ",
    cellHeader: "ค่าแรงดันแต่ละเซลล์ (V)",
    legendMax: "สูงสุด",
    legendMin: "ต่ำสุด",
    legendNormal: "ปกติ",
    unavailable: "ไม่มีข้อมูล",
    gridSolar: "กริด/โซลาร์",
    load: "โหลด",
    charging: "กำลังชาร์จ",
    discharging: "กำลังจ่าย",
    idle: "ไม่ทำงาน",
    remaining: "คงเหลือ",
    resistance: "ความต้านทาน",
    charge: "ชาร์จ",
    discharge: "จ่ายไฟ",
    balance: "บาลานซ์",
    statusOn: "ON",
    statusOff: "OFF",
    maxCell: "เซลล์สูงสุด",
    minCell: "เซลล์ต่ำสุด",
    socLabel: "SoC",
    remainingLabel: "คงเหลือ",
  },
  en: {
    toggleTh: "ไทย",
    toggleEn: "English",
    packPower: "Batt Power",
    avgCell: "Avg Cell",
    deltaCell: "Delta Cell",
    temp1: "Temp T1",
    temp2: "Temp T2",
    mosTemp: "MOS Temp",
    soc: "SOC",
    remainCap: "Remain Cap",
    totalCap: "Total Cap",
    soh: "SOH",
    cycles: "Cycles",
    cellHeader: "Cell Voltages (V)",
    legendMax: "Highest",
    legendMin: "Lowest",
    legendNormal: "Normal",
    unavailable: "Unavailable",
    gridSolar: "Grid/Solar",
    load: "Load",
    charging: "Charging",
    discharging: "Discharging",
    idle: "Idle",
    remaining: "Remaining",
    resistance: "Resistance",
    charge: "Charge",
    discharge: "Discharge",
    balance: "Balance",
    statusOn: "ON",
    statusOff: "OFF",
    maxCell: "Max Cell",
    minCell: "Min Cell",
    socLabel: "SoC",
    remainingLabel: "Remaining",
  },
};

const DEFAULT_MAX_CELLS = 16;

class BatteryCellCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._lang = "en";
  }

  setConfig(config) {
    if (!config || !config.entities) {
      throw new Error("กรุณากำหนด entities ใน config ของการ์ด (entities: required)");
    }
    this._config = {
      name: config.name || "Battery Cell Card",
      show_language_toggle: config.show_language_toggle !== false,
      default_language: config.default_language === "th" ? "th" : "en",
      cell_count: config.cell_count || DEFAULT_MAX_CELLS,
      cell_columns: config.cell_columns || 4,
      bar_columns: config.bar_columns || 8,
      decimals_voltage: config.decimals_voltage ?? 2,
      decimals_cell: config.decimals_cell ?? 3,
      decimals_current: config.decimals_current ?? 2,
      show_sparklines: config.show_sparklines !== false,
      sparkline_hours: config.sparkline_hours || 6,
      sparkline_style: config.sparkline_style === "line" ? "line" : "area",
      cell_list_style: config.cell_list_style === "list" ? "list" : "battery",
      cell_min_voltage: config.cell_min_voltage ?? 2.6,
      cell_max_voltage: config.cell_max_voltage ?? 3.65,
      center_style: config.center_style === "arc" ? "arc" : "battery-shape",
      show_header_info: config.show_header_info !== false,
      entities: config.entities,
    };
    this._lang = this._config.default_language;
    this._rendered = false;
    this._sparklineCache = {};
    this._render();
    this._fetchSparklines();
  }

  set hass(hass) {
    const firstHass = !this._hass;
    this._hass = hass;
    this._render();
    if (firstHass) {
      this._fetchSparklines();
      // รีเฟรช sparkline ทุก 5 นาที (ไม่ต้องถี่กว่านี้ เพราะ HA history
      // ไม่เปลี่ยนเร็วพอที่จะคุ้มกับการยิง API ทุกครั้งที่ state อัปเดต)
      if (this._sparklineInterval) clearInterval(this._sparklineInterval);
      this._sparklineInterval = setInterval(() => this._fetchSparklines(), 5 * 60 * 1000);
    }
  }

  disconnectedCallback() {
    if (this._sparklineInterval) clearInterval(this._sparklineInterval);
  }

  getCardSize() {
    const rows = Math.ceil(this._config?.cell_count / (this._config?.cell_columns || 4)) || 4;
    return 4 + rows;
  }

  static getConfigElement() {
    return document.createElement("battery-cell-card-editor");
  }

  static getStubConfig(hass) {
    const entities = hass ? Object.keys(hass.states) : [];
    const find = (suffix) =>
      entities.find((e) => e.startsWith("sensor.") && e.includes(suffix)) || "";
    return {
      type: "custom:battery-cell-card",
      name: "Battery Cell Card",
      entities: {
        total_voltage: find("total_voltage") || find("pack_voltage"),
        current: find("current"),
        power: find("power"),
        soc: find("state_of_charge") || find("capacity_remaining_percent"),
        remaining_capacity: find("capacity_remaining") || find("remaining_capacity"),
        total_capacity: find("total_battery_capacity") || find("battery_capacity"),
        soh: find("state_of_health"),
        cycles: find("charging_cycles") || find("total_cycles"),
        avg_cell_voltage: find("average_cell_voltage"),
        delta_cell_voltage: find("delta_cell_voltage"),
        temp_1: find("temperature_sensor_1") || find("temperature_1"),
        temp_2: find("temperature_sensor_2") || find("temperature_2"),
        temp_3: find("temperature_sensor_3") || find("temperature_3"),
        temp_4: find("temperature_sensor_4") || find("temperature_4"),
        mos_temp: find("power_tube_temperature") || find("mosfet_temperature"),
        max_voltage_cell_index: find("max_voltage_cell"),
        min_voltage_cell_index: find("min_voltage_cell"),
        cell_voltage_prefix: "sensor.jk_bms_cell_voltage_",
        cell_resistance_prefix: find("cell_resistance_1") ? "sensor.jk_bms_cell_resistance_" : "",
      },
    };
  }

  _t(key) {
    return STRINGS[this._lang][key];
  }

  _getState(entityId) {
    if (!entityId || !this._hass) return undefined;
    const st = this._hass.states[entityId];
    if (!st || st.state === "unavailable" || st.state === "unknown") return undefined;
    const num = parseFloat(st.state);
    return Number.isNaN(num) ? st.state : num;
  }

  _getUnit(entityId, fallback) {
    if (!entityId || !this._hass) return fallback;
    const st = this._hass.states[entityId];
    return st?.attributes?.unit_of_measurement || fallback;
  }

  async _fetchSparklines() {
    if (!this._hass || !this._config?.show_sparklines) return;

    const ents = this._config.entities;
    const sparklineFields = ["total_voltage", "mos_temp", "temp_1", "temp_2", "temp_3", "temp_4"];
    const entityIds = sparklineFields
      .map((f) => ents[f])
      .filter((id) => !!id);

    if (entityIds.length === 0) return;

    const hoursAgo = this._config.sparkline_hours || 6;
    const start = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    try {
      // HA history API: GET history/period/<start>?filter_entity_id=a,b,c
      // คืนค่าเป็น array ของ array (หนึ่งชุดต่อ entity ตามลำดับ filter)
      //
      // significant_changes_only=false สำคัญมาก — ค่า default ของ HA คือ
      // true ซึ่งจะกรองจุดข้อมูลที่เปลี่ยนแปลง "เล็กน้อย" ออกไป ทำให้กราฟ
      // ดูเรียบเกินจริง ใส่ false เพื่อให้ได้จุดข้อมูลทุกจุดที่บันทึกจริง
      // (raw resolution) ตามที่ต้องการให้กราฟมีลูกคลื่นถี่ชัดเจน
      const results = await this._hass.callApi(
        "GET",
        `history/period/${start}?filter_entity_id=${entityIds.join(",")}&minimal_response&no_attributes&significant_changes_only=false`
      );

      const newCache = {};
      entityIds.forEach((id, i) => {
        const series = results?.[i] || [];
        const values = series
          .map((pt) => parseFloat(pt.state))
          .filter((v) => !Number.isNaN(v));
        newCache[id] = values;
      });
      this._sparklineCache = newCache;
      this._render();
    } catch (err) {
      // ถ้า history API พังหรือไม่มีสิทธิ์เข้าถึง ไม่ทำให้การ์ดทั้งใบพัง
      // แค่ไม่แสดง sparkline เฉยๆ
      console.warn("[battery-cell-card] ไม่สามารถดึงข้อมูล history สำหรับ sparkline:", err);
    }
  }

  _renderSparklineSvg(entityId, color) {
    const values = this._sparklineCache?.[entityId];
    if (!values || values.length < 2) return "";

    const w = 64;
    const h = 20;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return { x, y };
    });

    const lineStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

    if (this._config.sparkline_style === "line") {
      return `
        <svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <polyline points="${lineStr}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.85" />
        </svg>`;
    }

    // Area chart พร้อม gradient ไล่เฉด — แต่ละ sparkline ต้องมี gradient id
    // ที่ไม่ซ้ำกัน เพราะ SVG <defs> ใน shadow DOM เดียวกันใช้ id ร่วมกันทั้งหมด
    // ถ้าซ้ำ gradient ตัวหลังจะทับตัวแรกและทำให้สี/ทิศทางผิดเพี้ยนทุกกราฟ
    const gradId = `spark-grad-${entityId.replace(/[^a-zA-Z0-9]/g, "")}`;
    const areaPath = `M0,${h} L${lineStr} L${w},${h} Z`;

    return `
      <svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.75" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.05" />
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#${gradId})" stroke="none" />
        <polyline points="${lineStr}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" opacity="0.9" />
      </svg>`;
  }

  _fmt(value, decimals) {
    if (value === undefined || value === null) return "—";
    if (typeof value !== "number") return value;
    return value.toFixed(decimals);
  }

  _formatUptime(value, unit) {
    if (value === undefined || value === null) return "—";
    // ถ้าไม่ใช่ตัวเลข (เช่น entity ส่ง format string มาให้ตรงอยู่แล้ว
    // อย่าง "134D 18H") ให้ใช้ค่าตรงๆ ไม่ต้องแปลงซ้ำ
    if (typeof value !== "number") return String(value);

    const unitLower = String(unit).toLowerCase();
    // หน่วยที่ถือว่าเป็น "วินาทีดิบ" ต้องแปลงเป็น d/h/m ให้อ่านง่าย
    const isRawSeconds = ["s", "sec", "secs", "second", "seconds", ""].includes(unitLower);

    if (!isRawSeconds) {
      // หน่วยอื่นที่ไม่ใช่วินาที (เช่น "d", "h", "min") ให้แสดงตรงๆ
      // ไม่เดาแปลงให้ เพราะไม่รู้ว่าผู้ใช้ตั้งใจให้ตัวเลขนั้นหมายถึงอะไร
      return `${this._fmt(value, 0)}${unit ? " " + unit : ""}`;
    }

    const totalSeconds = Math.floor(value);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) return `${days}D ${hours}H`;
    if (hours > 0) return `${hours}H ${minutes}M`;
    if (minutes > 0) return `${minutes}M`;
    return `${totalSeconds}S`;
  }

  _sanitizeCellPrefix(rawPrefix) {
    if (!rawPrefix) return rawPrefix;
    // ผู้ใช้บางคนพิมพ์ prefix มาพร้อมเลข/ช่วงเลขต่อท้ายโดยไม่ตั้งใจ
    // เช่น "sensor.x_cell_voltage_1-16" หรือ "sensor.x_cell_voltage_1_16"
    // หรือ "sensor.x_cell_voltage_1" (เผลอใส่เลขเซลล์แรกติดมาด้วย)
    // ตัดส่วนเลข/ช่วงเลข/ขีดที่ต่อท้าย string ออกให้ก่อนใช้งาน
    // (จับเฉพาะที่ลงท้าย string เป๊ะๆ จึงไม่กระทบ prefix ที่มีเลขอยู่กลางคำ
    // เช่น "sensor.battery1_cell_voltage_")
    return rawPrefix.replace(/[-_]?\d+([-_]\d+)?$/, "");
  }

  _collectCellVoltages() {
    const ents = this._config.entities;
    const cells = [];

    const getResistance = (cellIndexFromOne) => {
      if (Array.isArray(ents.cell_resistances) && ents.cell_resistances[cellIndexFromOne - 1]) {
        return this._getState(ents.cell_resistances[cellIndexFromOne - 1]);
      }
      if (ents.cell_resistance_prefix) {
        let prefix = this._sanitizeCellPrefix(ents.cell_resistance_prefix);
        if (!prefix.endsWith("_")) prefix += "_";
        return this._getState(`${prefix}${cellIndexFromOne}`);
      }
      return undefined;
    };

    // หา entity ID ของแรงดันเซลล์ที่ index นี้: ใช้ explicit list ก่อน
    // ถ้าช่องนั้นใน list ว่าง/ไม่ได้ตั้ง (null/undefined/"") ค่อย fallback
    // ไปที่ prefix แบบ auto-number — ทำให้ตั้งค่าผ่าน UI ได้แบบผสมกัน
    // (ตั้งบาง cell ทีละตัว ปล่อยที่เหลือให้ prefix จัดการอัตโนมัติ)
    const getVoltageEntityId = (cellIndexFromOne) => {
      const explicit = Array.isArray(ents.cell_voltages) ? ents.cell_voltages[cellIndexFromOne - 1] : undefined;
      if (explicit) return explicit;
      if (ents.cell_voltage_prefix) {
        let prefix = this._sanitizeCellPrefix(ents.cell_voltage_prefix);
        if (!prefix.endsWith("_")) prefix += "_";
        return `${prefix}${cellIndexFromOne}`;
      }
      return undefined;
    };

    const hasExplicitList = Array.isArray(ents.cell_voltages) && ents.cell_voltages.length > 0;
    const hasPrefix = !!ents.cell_voltage_prefix;
    if (!hasExplicitList && !hasPrefix) return cells;

    // จำนวนเซลล์ทั้งหมดที่ต้องวนหา: ใช้ค่าที่มากกว่าระหว่าง cell_count
    // กับความยาวของ explicit list (เผื่อกรณี list ยาวกว่า cell_count)
    const totalCells = Math.max(this._config.cell_count || 0, hasExplicitList ? ents.cell_voltages.length : 0);

    for (let i = 1; i <= totalCells; i++) {
      const entityId = getVoltageEntityId(i);
      const v = this._getState(entityId);
      if (v !== undefined) {
        cells.push({ index: i, value: v, resistance: getResistance(i) });
      }
    }
    return cells;
  }

  _handleToggleLang(lang) {
    this._lang = lang;
    this._render();
  }

  _render() {
    if (!this._config) return;

    const ents = this._config.entities;
    const t = (k) => this._t(k);

    const totalVoltage = this._getState(ents.total_voltage);
    const current = this._getState(ents.current);
    const power = this._getState(ents.power);
    const avgCell = this._getState(ents.avg_cell_voltage);
    const rawDeltaCell = this._getState(ents.delta_cell_voltage);
    const temp1 = this._getState(ents.temp_1);
    const temp2 = this._getState(ents.temp_2);
    const temp3 = this._getState(ents.temp_3);
    const temp4 = this._getState(ents.temp_4);
    const mosTemp = this._getState(ents.mos_temp);
    const soc = this._getState(ents.soc);
    const remainCap = this._getState(ents.remaining_capacity);
    const totalCap = this._getState(ents.total_capacity);
    const soh = this._getState(ents.soh);
    const cycles = this._getState(ents.cycles);

    // --- Delta cell voltage: normalize เป็น mV เสมอ ---
    // บาง integration ส่ง delta cell มาเป็นโวลต์ (เช่น 0.001 V) พร้อม
    // unit_of_measurement: "V" จริงๆ ถ้าโชว์ตรงๆแบบปัดเศษ 0 ตำแหน่งจะ
    // กลายเป็น "0 V" เสมอ ทั้งที่ความต่างจริงมีอยู่ — ต้องตรวจหน่วยจริง
    // จาก entity แล้วแปลงเป็น mV ก่อนแสดงผลทุกครั้ง
    const rawDeltaUnit = this._getUnit(ents.delta_cell_voltage, "mV");
    let deltaCell = rawDeltaCell;
    let deltaUnit = "mV";
    if (rawDeltaCell !== undefined && typeof rawDeltaCell === "number") {
      const unitLower = String(rawDeltaUnit).toLowerCase();
      if (unitLower === "v") {
        deltaCell = rawDeltaCell * 1000;
      }
      // ถ้าหน่วยเป็น mV อยู่แล้ว หรือเป็นค่าว่าง/หน่วยอื่นที่ไม่รู้จัก
      // ใช้ค่าเดิมตรงๆ (สมมติว่าผู้ใช้ส่งมาเป็น mV ถูกต้องแล้ว)
    }

    const remainCapUnit = this._getUnit(ents.remaining_capacity, "Ah");
    const totalCapUnit = this._getUnit(ents.total_capacity, "Ah");

    // --- Header info bar (ทั้งหมด optional — ใส่เฉพาะ entity ที่มีจริง) ---
    const batteryLabel = this._getState(ents.battery_label);
    const hwVersion = this._getState(ents.hw_version);
    const swVersion = this._getState(ents.sw_version);
    const uptime = this._getState(ents.uptime);
    const uptimeUnit = this._getUnit(ents.uptime, "");
    const hasHeaderInfo =
      this._config.show_header_info &&
      (batteryLabel !== undefined ||
        totalCap !== undefined ||
        hwVersion !== undefined ||
        swVersion !== undefined ||
        uptime !== undefined);

    const cells = this._collectCellVoltages();
    const values = cells.map((c) => c.value);
    const computedMaxV = values.length ? Math.max(...values) : null;
    const computedMinV = values.length ? Math.min(...values) : null;
    const hasResistanceData = cells.some((c) => c.resistance !== undefined);

    // BMS-reported max/min cell index (e.g. JK-BMS "max_voltage_cell" /
    // "min_voltage_cell" sensors) takes priority over locally computed
    // max/min when available — this matches what the BMS itself considers
    // the extreme cell and resolves ties (two cells at the same voltage)
    // the same way the official app/BMS does.
    const maxCellIndex = this._getState(ents.max_voltage_cell_index);
    const minCellIndex = this._getState(ents.min_voltage_cell_index);
    const hasMaxIndexOverride = maxCellIndex !== undefined && !Number.isNaN(Number(maxCellIndex));
    const hasMinIndexOverride = minCellIndex !== undefined && !Number.isNaN(Number(minCellIndex));

    const currentSign = current !== undefined && current >= 0 ? "+" : "";
    const powerSign = power !== undefined && power >= 0 ? "+" : "";

    // ทิศทางพลังงาน: current > 0 = กำลังชาร์จ (รับไฟจาก Grid/Solar)
    //                current < 0 = กำลังจ่าย (ส่งไฟไปที่ Load)
    const isCharging = current !== undefined && current > 0.01;
    const isDischarging = current !== undefined && current < -0.01;
    const flowState = isCharging ? "charging" : isDischarging ? "discharging" : "idle";
    const socPct = soc !== undefined ? Math.max(0, Math.min(100, soc)) : 0;

    // --- Charge / Discharge / Balance status (อ่านค่าเฉยๆ ไม่มีปุ่มกด) ---
    // รองรับทั้ง binary_sensor (on/off) และ sensor ที่ส่ง state เป็น
    // ข้อความ เช่น "ON"/"OFF", "true"/"false", "1"/"0"
    const readBoolState = (entityId) => {
      if (!entityId || !this._hass) return undefined;
      const st = this._hass.states[entityId];
      if (!st || st.state === "unavailable" || st.state === "unknown") return undefined;
      const v = String(st.state).toLowerCase();
      if (["on", "true", "1", "charging", "discharging", "yes"].includes(v)) return true;
      if (["off", "false", "0", "no", "idle"].includes(v)) return false;
      return undefined;
    };
    const chargeStatus = readBoolState(ents.charge_status);
    const dischargeStatus = readBoolState(ents.discharge_status);
    const balanceStatus = readBoolState(ents.balance_status);

    // เลขลำดับเซลล์ที่ max/min (สำหรับโชว์ใต้กราฟ voltage หลัก)
    const maxCellLabel = hasMaxIndexOverride
      ? String(Number(maxCellIndex)).padStart(2, "0")
      : (() => {
          const found = cells.find((c) => computedMaxV !== null && c.value === computedMaxV);
          return found ? String(found.index).padStart(2, "0") : "—";
        })();
    const minCellLabel = hasMinIndexOverride
      ? String(Number(minCellIndex)).padStart(2, "0")
      : (() => {
          const found = cells.find((c) => computedMinV !== null && c.value === computedMinV);
          return found ? String(found.index).padStart(2, "0") : "—";
        })();

    const cellListHtml = cells
      .map((c) => {
        let cls = "cell-normal";
        if (hasMaxIndexOverride || hasMinIndexOverride) {
          if (hasMaxIndexOverride && c.index === Number(maxCellIndex)) cls = "cell-max";
          else if (hasMinIndexOverride && c.index === Number(minCellIndex)) cls = "cell-min";
        } else {
          if (computedMaxV !== null && c.value === computedMaxV) cls = "cell-max";
          else if (computedMinV !== null && c.value === computedMinV) cls = "cell-min";
        }
        const label = String(c.index).padStart(2, "0");
        const resistanceHtml =
          hasResistanceData && c.resistance !== undefined
            ? `<span class="cell-resistance">${this._fmt(c.resistance, 0)} mΩ</span>`
            : "";
        return `
          <div class="cell-row ${cls}">
            <span class="cell-row-label">${label}</span>
            <span class="cell-row-value">${this._fmt(c.value, this._config.decimals_cell)}V</span>
            ${resistanceHtml}
          </div>`;
      })
      .join("");

    // --- ขนาด scale แรงดันเซลล์ (ใช้ร่วมกับเซลล์ทรงแบตเตอรี่ด้านล่าง) ---
    const vMin = this._config.cell_min_voltage;
    const vMax = this._config.cell_max_voltage;
    const vRange = vMax - vMin || 1;

    // --- เซลล์ทรงแบตเตอรี่แนวตั้ง (cell_list_style: "battery") — ไอคอนแบตเตอรี่ตั้ง
    // ต่อเซลล์ พร้อมแรงดัน/ความต้านทานอยู่ภายในตัวแบตเลย (ไม่ใช่ข้อความแยกข้างนอก)
    // ใช้สี fill (เขียว/เหลือง/แดง) เทียบ min/max scale เดียวกับ thermometer bars,
    // ส่วนขอบของตัวแบตจะเป็นสีฟ้า/แดงเมื่อเป็นเซลล์สูงสุด/ต่ำสุด (แทนสีตัวเลขเดิม
    // เพราะตัวเลขตอนนี้เป็นสีขาวล้วนเพื่อให้อ่านง่ายบนพื้นสีอะไรก็ได้)
    const cellBatteryBorder = { "cell-max": "#38bdf8", "cell-min": "#f87171", "cell-normal": "#1f2a36" };
    const cellBatteryHtml = cells
      .map((c) => {
        let cls = "cell-normal";
        if (hasMaxIndexOverride || hasMinIndexOverride) {
          if (hasMaxIndexOverride && c.index === Number(maxCellIndex)) cls = "cell-max";
          else if (hasMinIndexOverride && c.index === Number(minCellIndex)) cls = "cell-min";
        } else {
          if (computedMaxV !== null && c.value === computedMaxV) cls = "cell-max";
          else if (computedMinV !== null && c.value === computedMinV) cls = "cell-min";
        }
        const fillPct = Math.max(0, Math.min(100, ((c.value - vMin) / vRange) * 100));
        const fillColor = fillPct <= 20 ? "#f87171" : fillPct <= 50 ? "#facc15" : "#4ade80";
        const label = String(c.index).padStart(2, "0");
        const resistanceHtml =
          c.resistance !== undefined
            ? `<div class="cell-batt-r">${this._fmt(c.resistance, 0)} mΩ</div>`
            : "";
        return `
          <div class="cell-batt-col">
            <div class="cell-batt-nub"></div>
            <div class="cell-batt-body" style="border-color: ${cellBatteryBorder[cls]};">
              <div class="cell-batt-fill" style="height: ${fillPct.toFixed(1)}%; background: ${fillColor};"></div>
              <div class="cell-batt-segment" style="bottom: 25%;"></div>
              <div class="cell-batt-segment" style="bottom: 50%;"></div>
              <div class="cell-batt-segment" style="bottom: 75%;"></div>
              <div class="cell-batt-gloss"></div>
              <div class="cell-batt-text">
                <div class="cell-batt-v">${this._fmt(c.value, this._config.decimals_cell)}V</div>
                ${resistanceHtml}
              </div>
            </div>
            <div class="cell-bar-label">${label}</div>
          </div>`;
      })
      .join("");

    const sparkRow = (entityId, color) =>
      this._config.show_sparklines ? this._renderSparklineSvg(entityId, color) : "";

    if (!this.shadowRoot.querySelector("ha-card")) {
      this.shadowRoot.innerHTML = `
        <style>${this._css()}</style>
        <ha-card>
          <div class="header-info-bar"></div>

          <div class="header">
            <div class="title"></div>
            ${
              this._config.show_language_toggle
                ? `<div class="lang-toggle">
                    <button class="lang-btn" data-lang="th">${t("toggleTh")}</button>
                    <button class="lang-btn" data-lang="en">${t("toggleEn")}</button>
                  </div>`
                : ""
            }
          </div>

          <div class="battery-visual">
            <div class="flow-icon flow-icon-left">
              <svg viewBox="0 0 24 24" class="icon-grid"><path d="M7 2v11h3v9l7-12h-4l4-8z" fill="currentColor"/></svg>
              <span class="flow-label" data-k="gridSolar"></span>
              <span class="flow-state flow-state-left"></span>
              <span class="flow-watt flow-watt-left"></span>
            </div>

            <div class="flow-connector flow-connector-left"></div>

            <div class="center-visual center-visual-arc">
              <div class="arc-gauge-wrap">
                <svg class="arc-gauge-svg" viewBox="0 0 200 216">
                  <defs>
                    <linearGradient id="arcGaugeGrad" x1="0%" y1="100%" x2="65%" y2="0%">
                      <stop class="arc-grad-stop-0" offset="0%" stop-color="#22c55e"/>
                      <stop class="arc-grad-stop-1" offset="50%" stop-color="#4ade80"/>
                      <stop offset="100%" stop-color="#38bdf8"/>
                    </linearGradient>
                    <filter id="arcGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <circle cx="32.82" cy="175.18" r="2.0" fill="rgba(74,222,128,0.8)"/>
                  <circle cx="24.64" cy="160.77" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="16.62" cy="146.88" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="11.13" cy="131.81" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="8.35" cy="116.02" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="5.36" cy="99.72" r="2.0" fill="rgba(74,222,128,0.8)"/>
                  <circle cx="11.13" cy="84.19" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="16.62" cy="69.12" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="24.64" cy="55.23" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="34.95" cy="42.95" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="45.51" cy="30.18" r="2.0" fill="rgba(74,222,128,0.8)"/>
                  <circle cx="61.12" cy="24.62" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="76.19" cy="19.13" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="91.98" cy="16.35" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="108.02" cy="16.35" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="124.59" cy="16.24" r="2.0" fill="rgba(74,222,128,0.8)"/>
                  <circle cx="138.88" cy="24.62" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="152.77" cy="32.64" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="165.05" cy="42.95" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="175.36" cy="55.23" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="186.10" cy="67.85" r="2.0" fill="rgba(74,222,128,0.8)"/>
                  <circle cx="188.87" cy="84.19" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="191.65" cy="99.98" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="191.65" cy="116.02" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="188.87" cy="131.81" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="186.10" cy="148.15" r="2.0" fill="rgba(74,222,128,0.8)"/>
                  <circle cx="175.36" cy="160.77" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <circle cx="165.05" cy="173.05" r="1.3" fill="rgba(74,222,128,0.4)"/>
                  <path class="arc-track" d="M 44.85 163.15 A 78.00 78.00 0 0 1 100.00 30.00 A 78.00 78.00 0 0 1 155.15 163.15" fill="none" stroke="#2a3744" stroke-width="14" stroke-linecap="round"/>
                  <path class="arc-progress-glow" d="M 44.85 163.15 A 78.00 78.00 0 0 1 100.00 30.00 A 78.00 78.00 0 0 1 155.15 163.15" fill="none" stroke="url(#arcGaugeGrad)" stroke-width="20" stroke-linecap="round" opacity="0.18" filter="url(#arcGlowFilter)"/>
                  <path class="arc-progress" d="M 44.85 163.15 A 78.00 78.00 0 0 1 100.00 30.00 A 78.00 78.00 0 0 1 155.15 163.15" fill="none" stroke="url(#arcGaugeGrad)" stroke-width="14" stroke-linecap="round"/>
                  <circle class="arc-pointer-ring" r="7.5" fill="#0c1117" stroke-width="3"/>
                  <circle class="arc-pointer-dot" r="2.6"/>
                </svg>
                <div class="arc-gauge-text">
                  <div class="arc-gauge-soc"></div>
                  <div class="arc-gauge-sub arc-gauge-voltage"></div>
                  <div class="arc-gauge-sub arc-gauge-current"></div>
                </div>
                <div class="arc-end-label arc-end-label-min">0</div>
                <div class="arc-end-label arc-end-label-max">100</div>
              </div>
            </div>

            <div class="center-visual center-visual-batteryshape">
              <div class="battshape-wrap">
                <svg class="battshape-svg" viewBox="0 0 240 200">
                  <defs>
                    <linearGradient id="battShapeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop class="battshape-grad-stop-0" offset="0%" stop-color="#22c55e"/>
                      <stop class="battshape-grad-stop-1" offset="100%" stop-color="#4ade80"/>
                    </linearGradient>
                    <linearGradient id="battShapeGloss" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
                      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                    </linearGradient>
                    <clipPath id="battShapeInnerClip"><rect x="22" y="64" width="194" height="72" rx="11"/></clipPath>
                    <clipPath id="battShapeOuterClip"><rect x="14" y="56" width="210" height="88" rx="18"/></clipPath>
                  </defs>
                  <rect class="battshape-glow" x="8" y="50" width="222" height="100" rx="22" fill="#4ade80" opacity="0.10" style="filter:blur(8px)"/>
                  <rect x="223" y="83" width="13" height="34" rx="4" fill="#2a3744"/>
                  <rect x="14" y="56" width="210" height="88" rx="18" fill="#161e27" stroke="#2a3744" stroke-width="4"/>
                  <rect class="battshape-fill" x="22" y="64" width="0" height="72" fill="url(#battShapeGrad)" clip-path="url(#battShapeInnerClip)"/>
                  <line x1="60.8" y1="67" x2="60.8" y2="133" stroke="rgba(0,0,0,0.28)" stroke-width="1.6"/>
                  <line x1="99.6" y1="67" x2="99.6" y2="133" stroke="rgba(0,0,0,0.28)" stroke-width="1.6"/>
                  <line x1="138.4" y1="67" x2="138.4" y2="133" stroke="rgba(0,0,0,0.28)" stroke-width="1.6"/>
                  <line x1="177.2" y1="67" x2="177.2" y2="133" stroke="rgba(0,0,0,0.28)" stroke-width="1.6"/>
                  <rect x="14" y="56" width="210" height="37" rx="14" fill="url(#battShapeGloss)" clip-path="url(#battShapeOuterClip)"/>
                </svg>
                <div class="battshape-text">
                  <div class="battshape-value"></div>
                </div>
              </div>
            </div>

            <div class="flow-connector flow-connector-right"></div>

            <div class="flow-icon flow-icon-right">
              <svg viewBox="0 0 24 24" class="icon-load"><path d="M12 2C8 2 5 5 5 9c0 3 2 5 2 5h10s2-2 2-5c0-4-3-7-7-7zm0 18a3 3 0 003-3H9a3 3 0 003 3z" fill="currentColor"/></svg>
              <span class="flow-label" data-k="load"></span>
              <span class="flow-state flow-state-right"></span>
              <span class="flow-watt flow-watt-right"></span>
            </div>
          </div>

          ${
            ents.charge_status || ents.discharge_status || ents.balance_status
              ? `<div class="status-row">
                  ${ents.charge_status ? `<div class="status-chip"><span class="status-label" data-k="charge"></span><span class="status-pill status-charge"></span></div>` : ""}
                  ${ents.discharge_status ? `<div class="status-chip"><span class="status-label" data-k="discharge"></span><span class="status-pill status-discharge"></span></div>` : ""}
                  ${ents.balance_status ? `<div class="status-chip"><span class="status-label" data-k="balance"></span><span class="status-pill status-balance"></span></div>` : ""}
                </div>`
              : ""
          }

          <div class="top-grid">
            <div class="panel">
              <div class="metric-row">
                <div class="big-value voltage"></div>
                <div class="spark spark-voltage"></div>
              </div>
              <div class="minmax-row">
                <span class="minmax-item minmax-max"><span data-k="maxCell"></span>: <span class="minmax-val max-cell-val"></span></span>
                <span class="minmax-item minmax-min"><span data-k="minCell"></span>: <span class="minmax-val min-cell-val"></span></span>
              </div>
              <div class="row"><span class="row-label" data-k="packPower"></span><span class="row-value power"></span></div>
              <div class="row"><span class="row-label" data-k="avgCell"></span><span class="row-value avgcell"></span></div>
              <div class="row"><span class="row-label" data-k="deltaCell"></span><span class="row-value deltacell"></span></div>
              <div class="row temp-row">
                <span class="row-label" data-k="temp1"></span><span class="row-value temp1"></span>
                <div class="spark spark-temp1"></div>
              </div>
              <div class="row temp-row">
                <span class="row-label" data-k="temp2"></span><span class="row-value temp2"></span>
                <div class="spark spark-temp2"></div>
              </div>
              <div class="row temp-row">
                <span class="row-label" data-k="mosTemp"></span><span class="row-value mostemp"></span>
                <div class="spark spark-mostemp"></div>
              </div>
            </div>
            <div class="panel">
              <div class="big-value current"></div>
              <div class="row"><span class="row-label" data-k="soc"></span><span class="row-value soc"></span></div>
              <div class="row"><span class="row-label" data-k="remainCap"></span><span class="row-value remaincap"></span></div>
              <div class="row"><span class="row-label" data-k="totalCap"></span><span class="row-value totalcap"></span></div>
              <div class="row"><span class="row-label" data-k="soh"></span><span class="row-value soh"></span></div>
              <div class="row"><span class="row-label" data-k="cycles"></span><span class="row-value cycles"></span></div>
            </div>
          </div>
          <div class="cell-section">
            <div class="cell-header">
              <span class="bolt">⚡</span>
              <span class="cell-header-text"></span>
            </div>
            <div class="legend">
              <span class="legend-item"><span class="dot dot-max"></span><span class="legend-text" data-k="legendMax"></span></span>
              <span class="legend-item"><span class="dot dot-min"></span><span class="legend-text" data-k="legendMin"></span></span>
              <span class="legend-item"><span class="dot dot-normal"></span><span class="legend-text" data-k="legendNormal"></span></span>
            </div>
            <div class="cell-list"></div>
            <div class="cell-battery"></div>
          </div>
        </ha-card>
      `;

      this.shadowRoot.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => this._handleToggleLang(btn.dataset.lang));
      });
    }

    const root = this.shadowRoot;
    root.querySelector(".title").textContent = this._config.name;

    root.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === this._lang);
      btn.textContent = btn.dataset.lang === "th" ? t("toggleTh") : t("toggleEn");
    });

    // --- Header info bar (optional) ---
    const headerInfoEl = root.querySelector(".header-info-bar");
    if (hasHeaderInfo) {
      const line1Parts = [];
      if (batteryLabel !== undefined) line1Parts.push(String(batteryLabel));
      if (totalCap !== undefined) line1Parts.push(`Capacity: ${this._fmt(totalCap, 0)} ${totalCapUnit}`);
      const line2Parts = [];
      if (hwVersion !== undefined) line2Parts.push(`HW: ${hwVersion}`);
      if (swVersion !== undefined) line2Parts.push(`SW: ${swVersion}`);
      if (uptime !== undefined) line2Parts.push(`Time: ${this._formatUptime(uptime, uptimeUnit)}`);

      headerInfoEl.style.display = "flex";
      headerInfoEl.innerHTML = `
        ${line1Parts.length ? `<div class="header-info-line">${line1Parts.join(" | ")}</div>` : ""}
        ${line2Parts.length ? `<div class="header-info-line header-info-line-accent">${line2Parts.join(" | ")}</div>` : ""}
      `;
    } else {
      headerInfoEl.style.display = "none";
      headerInfoEl.innerHTML = "";
    }

    // --- Battery visual ---
    root.querySelector('[data-k="gridSolar"]').textContent = t("gridSolar");
    root.querySelector('[data-k="load"]').textContent = t("load");

    // ใช้ค่าจาก charge_status/discharge_status entity (ถ้ามี) เป็นหลัก เพราะเป็นค่าที่ BMS
    // รายงานมาตรงๆ — ถ้าไม่ได้ตั้ง entity นี้ไว้ ค่อย fallback ไปใช้ทิศทางที่คำนวณจาก current แทน
    //
    // ข้อยกเว้น: ถ้า entity ทั้งสองฝั่งรายงาน "ON" พร้อมกัน (เป็นไปไม่ได้ในทางไฟฟ้าจริง —
    // แบตจะชาร์จกับคายประจุพร้อมกันไม่ได้ มักเกิดจาก BMS/sensor รายงานค้างหรือหน่วงเวลา)
    // ให้เชื่อทิศทางจากค่า current ที่วัดได้จริงแทน เพราะเป็นค่าต่อเนื่องที่ฟันธงทิศทางได้ชัดกว่า
    const statusConflict = chargeStatus === true && dischargeStatus === true;
    const effectiveCharging = statusConflict ? isCharging : chargeStatus !== undefined ? chargeStatus : isCharging;
    const effectiveDischarging = statusConflict ? isDischarging : dischargeStatus !== undefined ? dischargeStatus : isDischarging;
    const absPower = power !== undefined ? Math.abs(power) : undefined;

    const leftStateEl = root.querySelector(".flow-state-left");
    const rightStateEl = root.querySelector(".flow-state-right");
    leftStateEl.textContent = `${t("charge")}: ${effectiveCharging ? t("statusOn") : t("statusOff")}`;
    leftStateEl.className = "flow-state flow-state-left" + (effectiveCharging ? " active" : "");
    rightStateEl.textContent = `${t("discharge")}: ${effectiveDischarging ? t("statusOn") : t("statusOff")}`;
    rightStateEl.className = "flow-state flow-state-right" + (effectiveDischarging ? " active" : "");

    const leftWattEl = root.querySelector(".flow-watt-left");
    const rightWattEl = root.querySelector(".flow-watt-right");
    leftWattEl.textContent = effectiveCharging && absPower !== undefined ? `${this._fmt(absPower, 0)} W` : "";
    leftWattEl.className = "flow-watt flow-watt-left" + (effectiveCharging ? " active" : "");
    rightWattEl.textContent = effectiveDischarging && absPower !== undefined ? `${this._fmt(absPower, 0)} W` : "";
    rightWattEl.className = "flow-watt flow-watt-right" + (effectiveDischarging ? " active" : "");

    root.querySelector(".flow-icon-left").classList.toggle("active", effectiveCharging);
    root.querySelector(".flow-icon-right").classList.toggle("active", effectiveDischarging);
    root.querySelector(".flow-connector-left").classList.toggle("active", effectiveCharging);
    root.querySelector(".flow-connector-right").classList.toggle("active", effectiveDischarging);

    // --- สลับ center visual: arc gauge / battery-shape (เหลือ 2 แบบ) ---
    const centerArcEl = root.querySelector(".center-visual-arc");
    const centerBattShapeEl = root.querySelector(".center-visual-batteryshape");
    const socColor = socPct <= 20 ? "#f87171" : socPct <= 50 ? "#facc15" : "#4ade80";
    const socColorDark = socPct <= 20 ? "#dc2626" : socPct <= 50 ? "#d97706" : "#22c55e";

    centerArcEl.style.display = "none";
    centerBattShapeEl.style.display = "none";

    if (this._config.center_style === "arc") {
      centerArcEl.style.display = "flex";

      const trackEl = root.querySelector(".arc-track");
      const progressEl = root.querySelector(".arc-progress");
      const glowEl = root.querySelector(".arc-progress-glow");
      // path d คงที่เสมอ (270 องศาเท่ากันทุกครั้ง) ความยาว path จึงคงที่ —
      // วัดครั้งเดียวแล้ว cache ไว้ ไม่ต้องเรียก getTotalLength() ใหม่ทุก render
      if (this._arcPathLength === undefined) {
        this._arcPathLength = trackEl.getTotalLength();
      }
      const len = this._arcPathLength;
      const offset = len * (1 - socPct / 100);
      [progressEl, glowEl].forEach((el) => {
        el.style.strokeDasharray = `${len.toFixed(1)}`;
        el.style.strokeDashoffset = `${offset.toFixed(1)}`;
      });

      root.querySelector(".arc-grad-stop-0").setAttribute("stop-color", socColorDark);
      root.querySelector(".arc-grad-stop-1").setAttribute("stop-color", socColor);

      // ตำแหน่งจุดปลายแถบ (pointer) คำนวณจากมุมเดียวกับที่ใช้วาด path (เริ่ม 135°, กวาด 270°)
      const angleDeg = 135 + 270 * (socPct / 100);
      const angleRad = (angleDeg * Math.PI) / 180;
      const tipX = 100 + 78 * Math.cos(angleRad);
      const tipY = 108 + 78 * Math.sin(angleRad);
      root.querySelectorAll(".arc-pointer-ring, .arc-pointer-dot").forEach((el) => {
        el.setAttribute("cx", tipX.toFixed(2));
        el.setAttribute("cy", tipY.toFixed(2));
      });
      root.querySelector(".arc-pointer-ring").setAttribute("stroke", socColor);
      root.querySelector(".arc-pointer-dot").setAttribute("fill", socColor);

      root.querySelector(".arc-gauge-soc").textContent =
        soc !== undefined ? `${this._fmt(soc, 0)}%` : t("unavailable");
      root.querySelector(".arc-gauge-soc").style.color = socColor;
      root.querySelector(".arc-gauge-voltage").textContent =
        totalVoltage !== undefined ? `${this._fmt(totalVoltage, this._config.decimals_voltage)} V` : "—";
      root.querySelector(".arc-gauge-current").textContent =
        current !== undefined ? `${currentSign}${this._fmt(current, this._config.decimals_current)} A` : "—";
    } else {
      // battery-shape คือ default ตอนนี้ (center_style อื่นที่เหลือคือ "arc" ที่จัดการไปแล้วด้านบน)
      centerBattShapeEl.style.display = "flex";

      const innerW = 194;
      const fillEl = root.querySelector(".battshape-fill");
      fillEl.setAttribute("width", `${(innerW * socPct / 100).toFixed(1)}`);
      root.querySelector(".battshape-grad-stop-0").setAttribute("stop-color", socColorDark);
      root.querySelector(".battshape-grad-stop-1").setAttribute("stop-color", socColor);
      root.querySelector(".battshape-glow").setAttribute("fill", socColor);

      root.querySelector(".battshape-value").textContent =
        soc !== undefined ? `${this._fmt(soc, 0)}%` : t("unavailable");
    }

    // --- Sparklines ---
    if (this._config.show_sparklines) {
      root.querySelector(".spark-voltage").innerHTML = sparkRow(ents.total_voltage, "#f59e0b");
      root.querySelector(".spark-temp1").innerHTML = sparkRow(ents.temp_1, "#facc15");
      root.querySelector(".spark-temp2").innerHTML = sparkRow(ents.temp_2, "#facc15");
      root.querySelector(".spark-mostemp").innerHTML = sparkRow(ents.mos_temp, "#f59e0b");
    }

    // --- Main metrics ---
    root.querySelector(".voltage").textContent =
      totalVoltage !== undefined ? `${this._fmt(totalVoltage, this._config.decimals_voltage)} V` : t("unavailable");
    root.querySelector(".current").textContent =
      current !== undefined
        ? `${currentSign}${this._fmt(current, this._config.decimals_current)} A`
        : t("unavailable");

    root.querySelector('[data-k="packPower"]').textContent = t("packPower");
    root.querySelector(".power").textContent =
      power !== undefined ? `${powerSign}${this._fmt(power, 1)} W` : "—";
    root.querySelector(".power").className =
      "row-value power" + (power !== undefined ? (power >= 0 ? " positive" : " negative") : "");

    root.querySelector('[data-k="avgCell"]').textContent = t("avgCell");
    root.querySelector(".avgcell").textContent =
      avgCell !== undefined ? `${this._fmt(avgCell, this._config.decimals_cell)} V` : "—";

    root.querySelector('[data-k="deltaCell"]').textContent = t("deltaCell");
    root.querySelector(".deltacell").textContent =
      deltaCell !== undefined ? `${this._fmt(deltaCell, 0)} ${deltaUnit}` : "—";

    root.querySelector('[data-k="temp1"]').textContent = t("temp1");
    root.querySelector(".temp1").textContent = temp1 !== undefined ? `${this._fmt(temp1, 1)} °C` : "—";

    root.querySelector('[data-k="temp2"]').textContent = t("temp2");
    root.querySelector(".temp2").textContent = temp2 !== undefined ? `${this._fmt(temp2, 1)} °C` : "—";

    root.querySelector('[data-k="mosTemp"]').textContent = t("mosTemp");
    root.querySelector(".mostemp").textContent = mosTemp !== undefined ? `${this._fmt(mosTemp, 1)} °C` : "—";

    root.querySelector('[data-k="soc"]').textContent = t("soc");
    const socEl = root.querySelector(".soc");
    socEl.textContent = soc !== undefined ? `${this._fmt(soc, 0)} %` : "—";
    socEl.className = "row-value soc" + (soc !== undefined ? (soc <= 20 ? " warn" : "") : "");

    root.querySelector('[data-k="remainCap"]').textContent = t("remainCap");
    root.querySelector(".remaincap").textContent =
      remainCap !== undefined ? `${this._fmt(remainCap, 1)} ${remainCapUnit}` : "—";

    root.querySelector('[data-k="totalCap"]').textContent = t("totalCap");
    root.querySelector(".totalcap").textContent =
      totalCap !== undefined ? `${this._fmt(totalCap, 1)} ${totalCapUnit}` : "—";

    root.querySelector('[data-k="soh"]').textContent = t("soh");
    const sohEl = root.querySelector(".soh");
    sohEl.textContent = soh !== undefined ? `${this._fmt(soh, 1)} %` : "—";
    sohEl.className = "row-value soh" + (soh !== undefined ? (soh <= 50 ? " warn" : "") : "");

    root.querySelector('[data-k="cycles"]').textContent = t("cycles");
    root.querySelector(".cycles").textContent = cycles !== undefined ? this._fmt(cycles, 0) : "—";

    // --- Balance status pill (charge/discharge ย้ายไปแสดงที่ flow icon ซ้าย-ขวาแล้ว) ---
    const setStatusPill = (selector, state) => {
      const el = root.querySelector(selector);
      if (!el) return;
      if (state === undefined) {
        el.textContent = "—";
        el.className = el.className.replace(/\bstatus-(on|off)\b/g, "").trim();
      } else {
        el.textContent = state ? t("statusOn") : t("statusOff");
        el.className = el.className.replace(/\bstatus-(on|off)\b/g, "").trim() + (state ? " status-on" : " status-off");
      }
    };
    root.querySelectorAll('[data-k="balance"]').forEach((el) => (el.textContent = t("balance")));
    root.querySelectorAll('[data-k="charge"]').forEach((el) => (el.textContent = t("charge")));
    root.querySelectorAll('[data-k="discharge"]').forEach((el) => (el.textContent = t("discharge")));
    setStatusPill(".status-balance", balanceStatus);
    // ใช้ effectiveCharging/effectiveDischarging ตัวเดียวกับที่ไอคอน flow ซ้าย-ขวาใช้
    // (คำนวณไว้แล้วด้านบน) เพื่อให้ชิปสถานะตรงนี้กับไอคอน flow แสดงผลตรงกันเสมอ
    // ไม่ขัดแย้งกันเองแม้ entity charge_status/discharge_status จะรายงานค้างพร้อมกัน
    setStatusPill(".status-charge", ents.charge_status ? effectiveCharging : undefined);
    setStatusPill(".status-discharge", ents.discharge_status ? effectiveDischarging : undefined);

    // --- Max/min cell label ใต้กราฟ voltage หลัก ---
    const maxCellLabelEl = root.querySelector('[data-k="maxCell"]');
    const minCellLabelEl = root.querySelector('[data-k="minCell"]');
    if (maxCellLabelEl) maxCellLabelEl.textContent = t("maxCell");
    if (minCellLabelEl) minCellLabelEl.textContent = t("minCell");
    const maxCellValEl = root.querySelector(".max-cell-val");
    const minCellValEl = root.querySelector(".min-cell-val");
    if (maxCellValEl) maxCellValEl.textContent = cells.length ? maxCellLabel : "—";
    if (minCellValEl) minCellValEl.textContent = cells.length ? minCellLabel : "—";

    root.querySelector(".cell-header-text").textContent = t("cellHeader");
    root.querySelector('[data-k="legendMax"]').textContent = t("legendMax");
    root.querySelector('[data-k="legendMin"]').textContent = t("legendMin");
    root.querySelector('[data-k="legendNormal"]').textContent = t("legendNormal");

    // --- เลือกแสดง cell-list (แถบยาว) หรือ cell-battery (ทรงแบตเตอรี่) ---
    const cellListEl = root.querySelector(".cell-list");
    const cellBatteryEl = root.querySelector(".cell-battery");
    const style = this._config.cell_list_style;
    cellListEl.style.display = "none";
    cellBatteryEl.style.display = "none";
    if (style === "list") {
      cellListEl.style.display = "grid";
      cellListEl.innerHTML = cellListHtml || `<div class="cell-empty">${t("unavailable")}</div>`;
    } else {
      cellBatteryEl.style.display = "grid";
      const battCols = this._config.bar_columns || 8;
      cellBatteryEl.style.gridTemplateColumns = `repeat(${battCols}, 1fr)`;
      cellBatteryEl.innerHTML = cellBatteryHtml || `<div class="cell-empty">${t("unavailable")}</div>`;
    }
  }

  _css() {
    return `
      ha-card {
        background: #11181f;
        color: #e6edf3;
        border-radius: 16px;
        padding: 20px;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .header-info-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        margin-bottom: 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid #1f2a36;
      }
      .header-info-line {
        font-size: 14.5px;
        color: #9ba8b5;
        text-align: center;
        font-weight: 500;
      }
      .header-info-line-accent {
        font-size: 13.5px;
        color: #8b949e;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        margin-bottom: 18px;
        text-align: center;
      }
      .title {
        font-size: 16px;
        font-weight: 600;
        color: #c9d1d9;
      }
      .lang-toggle {
        display: flex;
        background: #1c2530;
        border-radius: 20px;
        padding: 3px;
        gap: 2px;
        position: absolute;
        right: 0;
      }
      .lang-btn {
        border: none;
        background: transparent;
        color: #8b949e;
        font-size: 13px;
        font-weight: 600;
        padding: 6px 16px;
        border-radius: 18px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-family: inherit;
      }
      .lang-btn.active {
        background: #38bdf8;
        color: #06202b;
      }

      /* --- Battery visual --- */
      .battery-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        margin-bottom: 20px;
        padding: 8px 4px;
      }
      .flow-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        width: 72px;
        flex-shrink: 0;
        opacity: 0.45;
        transition: opacity 0.3s ease;
      }
      .flow-icon.active { opacity: 1; }
      .flow-icon svg {
        width: 24px;
        height: 24px;
        color: #8b949e;
      }
      .flow-icon-left.active svg { color: #4ade80; }
      .flow-icon-right.active svg { color: #fb923c; }
      .flow-label {
        font-size: 10px;
        color: #8b949e;
        text-align: center;
      }
      .flow-state {
        font-size: 9.5px;
        font-weight: 700;
        color: #6b7785;
        text-align: center;
        white-space: nowrap;
      }
      .flow-state.active.flow-state-left { color: #4ade80; }
      .flow-state.active.flow-state-right { color: #fb923c; }
      .flow-watt {
        font-size: 11.5px;
        font-weight: 700;
        color: #6b7785;
        text-align: center;
        min-height: 14px;
      }
      .flow-watt.active.flow-watt-left { color: #4ade80; }
      .flow-watt.active.flow-watt-right { color: #fb923c; }

      .flow-connector {
        flex: 0 0 18px;
        height: 2px;
        border-top: 2px dashed #2a3744;
        margin: 0 2px;
        align-self: center;
        transform: translateY(-1px);
        transition: border-color 0.3s ease, opacity 0.3s ease;
      }
      .flow-connector-left.active { border-top-color: #4ade80; opacity: 0.85; }
      .flow-connector-right.active { border-top-color: #fb923c; opacity: 0.85; }

      .center-visual {
        flex: 1;
        display: flex;
        justify-content: center;
      }

      /* --- Arc gauge (270°, speedometer style) --- */
      .arc-gauge-wrap {
        position: relative;
        width: 168px;
        height: 148px;
      }
      .arc-gauge-svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .arc-track { transition: stroke 0.3s ease; }
      .arc-progress, .arc-progress-glow {
        transition: stroke-dashoffset 0.6s ease;
      }
      .arc-pointer-ring, .arc-pointer-dot {
        transition: cx 0.6s ease, cy 0.6s ease, fill 0.3s ease, stroke 0.3s ease;
      }
      .arc-gauge-text {
        position: absolute;
        top: 38%;
        left: 0;
        width: 100%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
      }
      .arc-gauge-soc {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #4ade80;
      }
      .arc-gauge-sub {
        font-size: 12.5px;
        font-weight: 600;
        color: #8b949e;
      }
      .arc-end-label {
        position: absolute;
        font-size: 11px;
        color: #6b7785;
        font-weight: 600;
        transform: translate(-50%, -50%);
      }
      .arc-end-label-min { left: 28.4%; top: 70%; }
      .arc-end-label-max { left: 71.6%; top: 70%; }

      /* --- Battery shape (horizontal icon) --- */
      .battshape-wrap {
        position: relative;
        width: 192px;
        height: 160px;
      }
      .battshape-svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .battshape-fill { transition: width 0.6s ease; }
      .battshape-text {
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        transform: translateY(-50%);
        display: flex;
        justify-content: center;
      }
      .battshape-value {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      }

      /* --- Charge/Discharge/Balance status row --- */
      .status-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: 10px;
        margin-bottom: 18px;
      }
      .status-chip {
        background: #161e27;
        border: 1px solid #1f2a36;
        border-radius: 12px;
        padding: 10px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .status-label {
        font-size: 12px;
        color: #8b949e;
        font-weight: 600;
      }
      .status-pill {
        font-size: 12px;
        font-weight: 800;
        padding: 2px 12px;
        border-radius: 10px;
        letter-spacing: 0.03em;
        background: #2a3744;
        color: #6b7785;
      }
      .status-pill.status-on {
        background: rgba(74, 222, 128, 0.18);
        color: #4ade80;
      }
      .status-pill.status-off {
        background: rgba(107, 119, 133, 0.18);
        color: #8b949e;
      }

      /* --- Min/Max cell label under voltage panel --- */
      .minmax-row {
        display: flex;
        justify-content: space-between;
        font-size: 11.5px;
        color: #8b949e;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #1f2a36;
      }
      .minmax-val {
        font-weight: 700;
      }
      .minmax-max .minmax-val { color: #38bdf8; }
      .minmax-min .minmax-val { color: #f87171; }

      /* --- Sparkline --- */
      .metric-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .spark {
        flex-shrink: 0;
        opacity: 0.9;
      }
      .spark svg.sparkline {
        width: 64px;
        height: 20px;
        display: block;
      }
      .temp-row {
        position: relative;
        gap: 8px;
      }
      .temp-row .spark {
        margin-left: auto;
      }
      .temp-row .spark svg.sparkline {
        width: 40px;
        height: 14px;
      }

      .top-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 18px;
      }
      .panel {
        background: #161e27;
        border-radius: 14px;
        padding: 16px 18px;
        border: 1px solid #1f2a36;
      }
      .big-value {
        font-size: 30px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .panel:not(:has(.metric-row)) .big-value { margin-bottom: 14px; }
      .big-value.voltage { color: #4ade80; }
      .big-value.current { color: #fb923c; margin-bottom: 14px; }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 6px 0;
        font-size: 13.5px;
      }
      .row-label {
        color: #8b949e;
        flex-shrink: 0;
      }
      .row-value {
        font-weight: 600;
        color: #e6edf3;
      }
      .row-value.power { color: #4ade80; }
      .row-value.power.negative { color: #f87171; }
      .row-value.soc { color: #f87171; }
      .row-value.soc:not(.warn) { color: #4ade80; }
      .row-value.soh { color: #f87171; }
      .row-value.soh:not(.warn) { color: #4ade80; }
      .row-value.avgcell, .row-value.totalcap { color: #4ade80; }
      .row-value.remaincap { color: #facc15; }
      .cell-section {
        background: #161e27;
        border-radius: 14px;
        padding: 18px;
        border: 1px solid #1f2a36;
      }
      .cell-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }
      .bolt { color: #fb923c; }
      .cell-header-text {
        font-weight: 600;
        font-size: 14px;
        color: #facc15;
      }
      .legend {
        display: flex;
        gap: 16px;
        margin-bottom: 14px;
        font-size: 12px;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #8b949e;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .dot-max { background: #38bdf8; }
      .dot-min { background: #f87171; }
      .dot-normal { background: #4ade80; }

      /* --- Cell list (แถบยาว) --- */
      .cell-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .cell-row {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #1c2530;
        border-radius: 8px;
        padding: 8px 12px;
        border-left: 3px solid #2a3744;
      }
      .cell-row.cell-max { border-left-color: #38bdf8; }
      .cell-row.cell-min { border-left-color: #f87171; }
      .cell-row.cell-normal { border-left-color: #4ade80; }
      .cell-row-label {
        font-size: 11px;
        color: #6b7785;
        font-weight: 700;
        width: 18px;
        flex-shrink: 0;
      }
      .cell-row-value {
        font-size: 13.5px;
        font-weight: 700;
        color: #4ade80;
        flex: 1;
      }
      .cell-row.cell-max .cell-row-value { color: #38bdf8; }
      .cell-row.cell-min .cell-row-value { color: #f87171; }
      .cell-resistance {
        font-size: 11px;
        color: #6b7785;
        flex-shrink: 0;
      }

      .cell-bar-label {
        font-size: 8.5px;
        color: #6b7785;
        background: #1c2530;
        border-radius: 4px;
        padding: 1px 3px;
        font-weight: 700;
        white-space: nowrap;
      }

      /* --- Vertical battery-shape per-cell display (cell_list_style: "battery") --- */
      .cell-battery {
        display: grid;
        gap: 10px 8px;
        padding-bottom: 4px;
      }
      .cell-batt-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        min-width: 0;
      }
      .cell-batt-nub {
        width: 36%;
        height: 6px;
        background: #2a3a4a;
        border-radius: 2px 2px 0 0;
        margin-bottom: -1px;
        flex-shrink: 0;
      }
      .cell-batt-body {
        position: relative;
        width: 100%;
        max-width: 46px;
        height: 110px;
        background: #16202b;
        border-radius: 7px;
        border: 1.5px solid #1f2a36;
        overflow: hidden;
        box-sizing: border-box;
        flex-shrink: 0;
      }
      .cell-batt-fill {
        position: absolute;
        left: 0; right: 0; bottom: 0;
        border-radius: 0 0 6px 6px;
        transition: height 0.5s ease, background-color 0.5s ease;
      }
      .cell-batt-segment {
        position: absolute;
        left: 4px; right: 4px;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
      }
      .cell-batt-gloss {
        position: absolute;
        top: 4px; bottom: 4px; left: 3px;
        width: 5px;
        border-radius: 4px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.03));
      }
      .cell-batt-text {
        position: absolute;
        left: 0; right: 0; top: 50%;
        transform: translateY(-50%);
        text-align: center;
        line-height: 1.25;
        pointer-events: none;
      }
      .cell-batt-v {
        font-size: 11.5px;
        font-weight: 800;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
        white-space: nowrap;
      }
      .cell-batt-r {
        font-size: 8.5px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.85);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
        white-space: nowrap;
      }

      .cell-empty {
        grid-column: 1 / -1;
        text-align: center;
        color: #8b949e;
        padding: 20px;
        font-size: 13px;
      }
      @media (max-width: 420px) {
        .top-grid { grid-template-columns: 1fr; }
        .battery-visual { gap: 4px; }
        .flow-icon { width: 54px; }
        .flow-label { font-size: 8.5px; }
        .flow-state { font-size: 8.5px; }
        .flow-watt { font-size: 10px; }
        .flow-connector { flex: 0 0 8px; }
        .cell-batt-body { height: 92px; }
      }
    `;
  }
}

class BatteryCellCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _entityField(key, label, domainFilter = "sensor") {
    return `
      <ha-entity-picker
        data-key="${key}"
        label="${label}"
        .hass="\${this._hass}"
        .value="\${this._config?.entities?.[key] || ''}"
        .includeDomains="\${['${domainFilter}']}"
        allow-custom-entity
      ></ha-entity-picker>`;
  }

  _autoDetect() {
    if (!this._hass) return;
    const allEntityIds = Object.keys(this._hass.states);
    const entityIds = allEntityIds.filter((id) => id.startsWith("sensor."));

    // หา prefix ที่เข้าข่าย JK-BMS โดยดูจาก entity ที่มีคำว่า total_voltage
    // อยู่ในชื่อ (เกือบทุก integration ของ JK-BMS จะมี sensor นี้เสมอ)
    const candidates = entityIds.filter((id) => id.includes("total_voltage"));
    if (candidates.length === 0) {
      alert(
        "ไม่พบ entity ที่เข้าข่าย JK-BMS โดยอัตโนมัติ (ไม่เจอ sensor ที่มีคำว่า total_voltage) กรุณาเลือก entity ด้วยตนเองด้านล่าง"
      );
      return;
    }

    // ถ้าเจอหลาย candidate (มีหลายแบต) ใช้ตัวแรกและเตือนผู้ใช้
    const refEntity = candidates[0];
    const prefix = refEntity.replace("total_voltage", "");

    const find = (suffix) => entityIds.find((id) => id === `${prefix}${suffix}`) || "";
    // charge/discharge/balance ส่วนใหญ่เป็น binary_sensor ไม่ใช่ sensor
    // ต้องค้นหาจาก allEntityIds (ทุก domain) แทน find() ปกติ
    const findBinary = (suffix) =>
      allEntityIds.find((id) => id === `binary_sensor.${prefix.replace("sensor.", "")}${suffix}`) || "";

    const newEntities = {
      ...this._config.entities,
      total_voltage: refEntity,
      current: find("current"),
      power: find("power"),
      soc: find("state_of_charge") || find("capacity_remaining_percent"),
      remaining_capacity: find("capacity_remaining") || find("remaining_capacity"),
      total_capacity: find("total_battery_capacity") || find("total_battery_capacity_setting"),
      soh: find("state_of_health"),
      cycles: find("charging_cycles") || find("total_cycles"),
      avg_cell_voltage: find("average_cell_voltage"),
      delta_cell_voltage: find("delta_cell_voltage"),
      temp_1: find("temperature_sensor_1"),
      temp_2: find("temperature_sensor_2"),
      temp_3: find("temperature_sensor_3"),
      temp_4: find("temperature_sensor_4"),
      mos_temp: find("power_tube_temperature"),
      max_voltage_cell_index: find("max_voltage_cell"),
      min_voltage_cell_index: find("min_voltage_cell"),
      charge_status: findBinary("charging"),
      discharge_status: findBinary("discharging"),
      balance_status: findBinary("balancing"),
      sw_version: find("firmware") || find("firmware_version"),
      uptime: find("uptime"),
      cell_voltage_prefix: `${prefix}cell_voltage_`,
    };

    this._config = { ...this._config, entities: newEntities };

    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    // รีเซ็ตเพื่อ re-render ด้วยค่าใหม่ที่ auto-detect ได้
    this.innerHTML = "";
    this._render();

    if (candidates.length > 1) {
      alert(
        `พบ entity ที่เข้าข่าย JK-BMS หลายชุด (${candidates.length} ชุด) — ใช้ prefix "${prefix}" เป็นค่าเริ่มต้น ถ้าไม่ตรงกับแบตที่ต้องการ กรุณาแก้ไขด้วยตนเองในแต่ละช่องด้านล่าง`
      );
    }
  }

  _render() {
    if (!this._hass || !this._config) return;

    // ต้อง rebuild ฟอร์มใหม่ทั้งหมดถ้า cell_count เปลี่ยน เพราะฟอร์ม
    // "ตั้งค่า entity รายเซลล์" สร้าง field ตามจำนวนนี้ตอน build ครั้งแรก
    // เท่านั้น — ถ้าไม่เช็ค ผู้ใช้แก้ cell_count แล้วฟอร์มจะค้างจำนวนเดิม
    const cellCountChanged = this._lastRenderedCellCount !== this._config.cell_count;
    if (cellCountChanged) {
      this.innerHTML = "";
      this._lastRenderedCellCount = this._config.cell_count;
    }

    if (!this.innerHTML) {
      const fields = [
        ["total_voltage", "Total Voltage"],
        ["current", "Current"],
        ["power", "Power"],
        ["soc", "State of Charge (%)"],
        ["remaining_capacity", "Remaining Capacity"],
        ["total_capacity", "Total Capacity"],
        ["soh", "State of Health (%)"],
        ["cycles", "Charging Cycles"],
        ["avg_cell_voltage", "Average Cell Voltage"],
        ["delta_cell_voltage", "Delta Cell Voltage"],
        ["temp_1", "Temperature Sensor 1"],
        ["temp_2", "Temperature Sensor 2"],
        ["temp_3", "Temperature Sensor 3 (optional)"],
        ["temp_4", "Temperature Sensor 4 (optional)"],
        ["mos_temp", "MOS / Power Tube Temperature"],
        ["max_voltage_cell_index", "Max Voltage Cell Index (BMS-reported, optional)"],
        ["min_voltage_cell_index", "Min Voltage Cell Index (BMS-reported, optional)"],
      ];

      // status fields ใช้ binary_sensor เป็นหลัก แต่ยังพิมพ์ entity ID
      // เองได้ผ่าน allow-custom-entity ถ้าเป็น sensor ธรรมดาที่ส่ง on/off
      const statusFields = [
        ["charge_status", "Charge Status (optional)"],
        ["discharge_status", "Discharge Status (optional)"],
        ["balance_status", "Balance Status (optional)"],
      ];

      // header info fields — ทั้งหมด optional, ไม่บังคับ domain ใดโดยเฉพาะ
      const headerFields = [
        ["battery_label", "Battery Label (optional, header info bar)"],
        ["hw_version", "Hardware Version (optional, header info bar)"],
        ["sw_version", "Software/Firmware Version (optional, header info bar)"],
        ["uptime", "Uptime (optional, header info bar)"],
      ];

      const inputStyle = `
        width: 100%;
        box-sizing: border-box;
        padding: 10px 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        font-size: 14px;
        font-family: inherit;
      `;
      const labelStyle = `
        font-size: 12px;
        color: var(--secondary-text-color);
        display: block;
        margin-bottom: 4px;
      `;

      this.innerHTML = `
        <div style="padding: 12px; display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label for="name" style="${labelStyle}">Card Name</label>
            <input type="text" id="name" value="${this._config.name || ""}" style="${inputStyle}" />
          </div>

          <div style="
            background: var(--secondary-background-color, #f0f0f0);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          ">
            <div style="font-size: 13px; font-weight: 500;">
              🔍 ตั้งค่าอัตโนมัติ
            </div>
            <div style="font-size: 12px; color: var(--secondary-text-color);">
              ถ้าระบบมี JK-BMS integration ติดตั้งอยู่แล้ว กดปุ่มนี้เพื่อให้การ์ดค้นหา
              และเติม entity ทั้งหมดให้อัตโนมัติ (สามารถแก้ไขเพิ่มเติมได้ด้านล่างหลังกด)
            </div>
            <mwc-button id="auto-detect-btn" raised>
              ค้นหา Entity อัตโนมัติ
            </mwc-button>
          </div>

          <div style="font-size: 13px; font-weight: 500; margin-top: 4px;">
            🎨 รูปแบบการแสดงผล
          </div>
          <div>
            <label for="center_style" style="font-size: 12px; color: var(--secondary-text-color); display: block; margin-bottom: 4px;">Center SoC Visual</label>
            <select id="center_style" style="
              width: 100%;
              box-sizing: border-box;
              padding: 10px 8px;
              border-radius: 4px;
              border: 1px solid var(--divider-color, #ccc);
              background: var(--card-background-color, #fff);
              color: var(--primary-text-color, #000);
              font-size: 14px;
              font-family: inherit;
            ">
              <option value="battery-shape">Battery shape (horizontal icon)</option>
              <option value="arc">Arc gauge (270°, speedometer style)</option>
            </select>
          </div>
          <div>
            <label for="cell_list_style" style="font-size: 12px; color: var(--secondary-text-color); display: block; margin-bottom: 4px;">Cell Voltage Display</label>
            <select id="cell_list_style" style="
              width: 100%;
              box-sizing: border-box;
              padding: 10px 8px;
              border-radius: 4px;
              border: 1px solid var(--divider-color, #ccc);
              background: var(--card-background-color, #fff);
              color: var(--primary-text-color, #000);
              font-size: 14px;
              font-family: inherit;
            ">
              <option value="list">Horizontal list</option>
              <option value="battery">Vertical battery shape</option>
            </select>
          </div>

          <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer;">
            <input type="checkbox" id="show_language_toggle" style="width: 18px; height: 18px; cursor: pointer;" />
            Show language toggle (TH/EN)
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer;">
            <input type="checkbox" id="show_sparklines" style="width: 18px; height: 18px; cursor: pointer;" />
            Show sparklines (6h history graphs)
          </label>
          <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer;">
            <input type="checkbox" id="show_header_info" style="width: 18px; height: 18px; cursor: pointer;" />
            Show header info bar (capacity/HW/SW/uptime)
          </label>

          <div style="font-size: 13px; color: var(--secondary-text-color); margin-top: 4px;">
            Entities — แก้ไขทีละช่องได้ที่นี่ (หรือใช้ปุ่มค้นหาอัตโนมัติด้านบนก่อน)
          </div>
          ${fields
            .map(
              ([key, label]) => `
            <ha-entity-picker
              data-key="${key}"
              label="${label}"
              allow-custom-entity
            ></ha-entity-picker>`
            )
            .join("")}

          <div style="font-size: 13px; font-weight: 500; margin-top: 4px;">
            🔌 สถานะ Charge / Discharge / Balance (optional — ไม่ใส่ก็ซ่อนแถวนี้ไปเลย)
          </div>
          ${statusFields
            .map(
              ([key, label]) => `
            <ha-entity-picker
              data-key="${key}"
              data-domain="binary_sensor"
              label="${label}"
              allow-custom-entity
            ></ha-entity-picker>`
            )
            .join("")}

          <div style="font-size: 13px; font-weight: 500; margin-top: 4px;">
            🧾 Header Info Bar (optional — ใส่เท่าที่มี ไม่ใส่เลยก็ซ่อนทั้งแถบ)
          </div>
          ${headerFields
            .map(
              ([key, label]) => `
            <ha-entity-picker
              data-key="${key}"
              label="${label}"
              allow-custom-entity
            ></ha-entity-picker>`
            )
            .join("")}

          <div>
            <label for="cell_count" style="${labelStyle}">Number of Cells</label>
            <input type="number" id="cell_count" value="${this._config.cell_count || DEFAULT_MAX_CELLS}" style="${inputStyle}" />
          </div>

          <div style="font-size: 13px; font-weight: 500; margin-top: 4px;">
            🔋 Per-Cell Voltage / Resistance Entities
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color);">
            เลือกได้ 2 แบบ: (A) ตั้ง Prefix ให้การ์ดเติมเลข 1...N ต่อท้ายเอง — ใช้ได้
            ถ้า entity ของคุณลงท้ายด้วยเลขเซลล์ (เช่น ..._cell_voltage_1, ..._2, ...)
            หรือ (B) ตั้ง entity ทีละเซลล์ด้านล่าง ถ้าชื่อ entity ไม่ใช่ prefix+เลขท้าย
            (เช่น เลขอยู่กลางชื่อ) — (B) จะถูกใช้ก่อนถ้าตั้งค่าไว้
          </div>

          <div>
            <label for="cell_voltage_prefix" style="${labelStyle}">Cell Voltage Entity Prefix — no numbers (e.g. sensor.jk_bms_cell_voltage_, NOT _1-16)</label>
            <input type="text" id="cell_voltage_prefix" value="${this._config.entities?.cell_voltage_prefix || ""}" style="${inputStyle}" />
          </div>
          <div>
            <label for="cell_resistance_prefix" style="${labelStyle}">Cell Resistance Entity Prefix (optional, mΩ)</label>
            <input type="text" id="cell_resistance_prefix" value="${this._config.entities?.cell_resistance_prefix || ""}" style="${inputStyle}" />
          </div>

          <details id="per-cell-details" style="border: 1px solid var(--divider-color, #ccc); border-radius: 6px; padding: 8px;">
            <summary style="cursor: pointer; font-size: 13px; font-weight: 500;">
              ⚙️ ตั้งค่า Entity รายเซลล์ทีละตัว (ถ้าไม่ใช้ Prefix ด้านบน)
            </summary>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
              ${Array.from({ length: this._config.cell_count || DEFAULT_MAX_CELLS }, (_, i) => i + 1)
                .map(
                  (n) => `
                <div style="display: flex; gap: 6px; align-items: flex-end;">
                  <div style="flex: 1;">
                    <label for="cell_voltage_${n}" style="${labelStyle}">Cell ${n} Voltage</label>
                    <ha-entity-picker
                      id="cell_voltage_${n}"
                      data-cell-index="${n - 1}"
                      data-cell-type="voltage"
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                  <div style="flex: 1;">
                    <label for="cell_resistance_${n}" style="${labelStyle}">Cell ${n} Resistance (mΩ)</label>
                    <ha-entity-picker
                      id="cell_resistance_${n}"
                      data-cell-index="${n - 1}"
                      data-cell-type="resistance"
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                </div>`
                )
                .join("")}
            </div>
          </details>

          <div>
            <label for="cell_columns" style="${labelStyle}">Cell Grid Columns (used when display is Horizontal list)</label>
            <input type="number" id="cell_columns" value="${this._config.cell_columns || 4}" style="${inputStyle}" />
          </div>
          <div>
            <label for="bar_columns" style="${labelStyle}">Cells Per Row (used when Cell Voltage Display is Vertical battery shape)</label>
            <input type="number" id="bar_columns" value="${this._config.bar_columns || 8}" style="${inputStyle}" />
          </div>
          <div>
            <label for="cell_min_voltage" style="${labelStyle}">Thermometer Bar Scale — Min Voltage</label>
            <input type="number" id="cell_min_voltage" value="${this._config.cell_min_voltage ?? 2.6}" style="${inputStyle}" />
          </div>
          <div>
            <label for="cell_max_voltage" style="${labelStyle}">Thermometer Bar Scale — Max Voltage</label>
            <input type="number" id="cell_max_voltage" value="${this._config.cell_max_voltage ?? 3.65}" style="${inputStyle}" />
          </div>
          <div>
            <label for="sparkline_hours" style="${labelStyle}">Sparkline History Range (hours)</label>
            <input type="number" id="sparkline_hours" value="${this._config.sparkline_hours || 6}" style="${inputStyle}" />
          </div>
        </div>
      `;

      this.querySelector("#auto-detect-btn")?.addEventListener("click", () => this._autoDetect());

      // ตั้งค่าเริ่มต้นให้ ha-select และ ha-switch ผ่าน JS property โดยตรง
      // (ใส่เป็น .value="..." ตรงๆใน innerHTML string ใช้ไม่ได้ เพราะ
      // .property= syntax ทำงานเฉพาะใน lit-html template ไม่ใช่ raw HTML)
      const centerStyleEl = this.querySelector("#center_style");
      if (centerStyleEl) centerStyleEl.value = this._config.center_style === "arc" ? "arc" : "battery-shape";
      const cellListStyleEl = this.querySelector("#cell_list_style");
      if (cellListStyleEl) cellListStyleEl.value = this._config.cell_list_style === "list" ? "list" : "battery";
      const langToggleEl = this.querySelector("#show_language_toggle");
      if (langToggleEl) langToggleEl.checked = this._config.show_language_toggle !== false;
      const sparklinesEl = this.querySelector("#show_sparklines");
      if (sparklinesEl) sparklinesEl.checked = this._config.show_sparklines !== false;
      const headerInfoEl = this.querySelector("#show_header_info");
      if (headerInfoEl) headerInfoEl.checked = this._config.show_header_info !== false;

      this.querySelectorAll("ha-entity-picker[data-key]").forEach((picker) => {
        picker.hass = this._hass;
        const key = picker.dataset.key;
        const domain = picker.dataset.domain;
        if (domain) picker.includeDomains = [domain];
        picker.value = this._config.entities?.[key] || "";
        picker.addEventListener("value-changed", (ev) => {
          ev.stopPropagation();
          this._updateConfig("entities." + key, ev.detail.value);
        });
      });

      // entity picker รายเซลล์ (cell_voltage_N / cell_resistance_N) — ใช้
      // array cell_voltages / cell_resistances แทน key ตรงๆแบบ field ทั่วไป
      // เพราะต้องเก็บเป็นลำดับ index ไม่ใช่ named key
      this.querySelectorAll("ha-entity-picker[data-cell-index]").forEach((picker) => {
        picker.hass = this._hass;
        const idx = parseInt(picker.dataset.cellIndex, 10);
        const cellType = picker.dataset.cellType; // "voltage" | "resistance"
        const arrayKey = cellType === "resistance" ? "cell_resistances" : "cell_voltages";
        const currentArray = this._config.entities?.[arrayKey] || [];
        picker.value = currentArray[idx] || "";
        picker.addEventListener("value-changed", (ev) => {
          ev.stopPropagation();
          const newArray = [...(this._config.entities?.[arrayKey] || [])];
          newArray[idx] = ev.detail.value;
          this._updateConfig("entities." + arrayKey, newArray);
        });
      });

      this.querySelector("#name")?.addEventListener("input", (ev) => {
        this._updateConfig("name", ev.target.value);
      });
      this.querySelector("#center_style")?.addEventListener("change", (ev) => {
        this._updateConfig("center_style", ev.target.value);
      });
      this.querySelector("#cell_list_style")?.addEventListener("change", (ev) => {
        this._updateConfig("cell_list_style", ev.target.value);
      });
      this.querySelector("#show_language_toggle")?.addEventListener("change", (ev) => {
        this._updateConfig("show_language_toggle", ev.target.checked);
      });
      this.querySelector("#show_sparklines")?.addEventListener("change", (ev) => {
        this._updateConfig("show_sparklines", ev.target.checked);
      });
      this.querySelector("#show_header_info")?.addEventListener("change", (ev) => {
        this._updateConfig("show_header_info", ev.target.checked);
      });
      this.querySelector("#cell_voltage_prefix")?.addEventListener("input", (ev) => {
        this._updateConfig("entities.cell_voltage_prefix", ev.target.value);
      });
      this.querySelector("#cell_resistance_prefix")?.addEventListener("input", (ev) => {
        this._updateConfig("entities.cell_resistance_prefix", ev.target.value);
      });
      this.querySelector("#cell_count")?.addEventListener("change", (ev) => {
        this._updateConfig("cell_count", parseInt(ev.target.value, 10) || DEFAULT_MAX_CELLS);
      });
      this.querySelector("#cell_columns")?.addEventListener("input", (ev) => {
        this._updateConfig("cell_columns", parseInt(ev.target.value, 10) || 4);
      });
      this.querySelector("#bar_columns")?.addEventListener("input", (ev) => {
        this._updateConfig("bar_columns", parseInt(ev.target.value, 10) || 8);
      });
      this.querySelector("#cell_min_voltage")?.addEventListener("input", (ev) => {
        this._updateConfig("cell_min_voltage", parseFloat(ev.target.value));
      });
      this.querySelector("#cell_max_voltage")?.addEventListener("input", (ev) => {
        this._updateConfig("cell_max_voltage", parseFloat(ev.target.value));
      });
      this.querySelector("#sparkline_hours")?.addEventListener("input", (ev) => {
        this._updateConfig("sparkline_hours", parseInt(ev.target.value, 10) || 6);
      });
    } else {
      this.querySelectorAll("ha-entity-picker").forEach((picker) => {
        picker.hass = this._hass;
      });
    }
  }

  _updateConfig(path, value) {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    const keys = path.split(".");
    let obj = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this._config = newConfig;

    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    // เรียก _render() เองทันที ไม่รอ round-trip กลับจาก parent (setConfig)
    // เพราะ parent อาจ debounce/delay การส่ง config กลับมา ทำให้ UI
    // (เช่น ฟอร์มรายเซลล์ที่ต้อง rebuild ตอน cell_count เปลี่ยน) ดูค้าง
    this._render();
  }
}

customElements.define("battery-cell-card", BatteryCellCard);
customElements.define("battery-cell-card-editor", BatteryCellCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "battery-cell-card",
  name: "Battery Cell Card",
  description: "แสดงข้อมูลแบตเตอรี่ BMS (JK-BMS และอื่นๆ): แรงดัน/กระแสรวม, SOC แบบทรงแบตเตอรี่หรือมาตรวัด arc, ความจุ, อุณหภูมิ, สถานะ Charge/Discharge/Balance และแรงดันแต่ละเซลล์พร้อมไฮไลต์สูงสุด/ต่ำสุด",
  preview: true,
  documentationURL: "https://github.com/pakkardkaw",
});
