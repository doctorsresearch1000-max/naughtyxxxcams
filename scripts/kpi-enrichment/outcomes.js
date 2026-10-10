"use strict";

/**
 * @typedef {'success' | 'failure' | 'skipped' | 'not_attempted'} MetricOutcomeStatus
 *
 * @typedef {object} MetricOutcomeSuccess
 * @property {'success'} status
 * @property {number} value
 *
 * @typedef {object} MetricOutcomeFailure
 * @property {'failure'} status
 * @property {string} message
 *
 * @typedef {object} MetricOutcomeSkipped
 * @property {'skipped'} status
 * @property {string} reason
 *
 * @typedef {object} MetricOutcomeNotAttempted
 * @property {'not_attempted'} status
 *
 * @typedef {MetricOutcomeSuccess | MetricOutcomeFailure | MetricOutcomeSkipped | MetricOutcomeNotAttempted} MetricOutcome
 */

/** @param {number} value */
function metricSuccess(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError("metricSuccess requires a finite number");
  }
  return { status: "success", value };
}

/** @param {string} message */
function metricFailure(message) {
  return { status: "failure", message: message || "unknown error" };
}

/** @param {string} reason */
function metricSkipped(reason) {
  return { status: "skipped", reason: reason || "skipped" };
}

function metricNotAttempted() {
  return { status: "not_attempted" };
}

/** @param {MetricOutcome | undefined} outcome */
function isSuccessfulOutcome(outcome) {
  return outcome?.status === "success";
}

module.exports = {
  metricSuccess,
  metricFailure,
  metricSkipped,
  metricNotAttempted,
  isSuccessfulOutcome,
};
