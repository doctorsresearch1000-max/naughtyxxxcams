"use strict";

function timestamp() {
  return new Date().toISOString();
}

function line(level, message) {
  return `[${timestamp()}] [${level}] ${message}`;
}

const log = {
  section(title) {
    console.log(`\n━━ ${title} ━━`);
  },
  info(message) {
    console.log(line("INFO", message));
  },
  success(message) {
    console.log(line("OK", message));
  },
  warn(message) {
    console.warn(line("WARN", message));
  },
  error(message) {
    console.error(line("ERROR", message));
  },
  metricFilled(domain, metricLabel, value, providerId) {
    console.log(
      line(
        "ENRICH",
        `${domain} · ${metricLabel} = ${value} (fuente: ${providerId})`,
      ),
    );
  },
  metricZeroed(domain, metricLabel, reason) {
    console.log(
      line("ZERO", `${domain} · ${metricLabel} = 0 (${reason})`),
    );
  },
};

module.exports = { log };
