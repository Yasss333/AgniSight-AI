const twilio = require("twilio");
const logger = require("../utils/logger.js");
const SPIKE_THRESHOLD = parseInt(process.env.SPIKE_THRESHOLD) || 3;
// Twilio client — only init if credentials exist
console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN);
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Track last frame time per session
const sessionActivity  = new Map();
// Track sent alerts to avoid spamming (1 alert per session per type)
const sentAlerts       = new Map();

const NO_ACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
// const SPIKE_THRESHOLD        = 3;              // boxes changed in one frame

// ── Twilio Helpers ───────────────────────────────────────────────

const sendSMS = async (message) => {
  console.log("🔥 sendSMS function called");
    if (!twilioClient) {
    logger.warn("Twilio not configured — skipping SMS");
    return;
  }
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER,
      to:   process.env.TWILIO_ALERT_NUMBER,
    });
    logger.info(`SMS sent: ${result.sid}`);
  } catch (err) {
    logger.error(`Twilio SMS error: ${err.message}`);
  }
};

const makeCall = async (message) => {
  console.log("🔥 makeCall function called");
    if (!twilioClient) {
    logger.warn("Twilio not configured — skipping call");
    return;
  }
  try {
    // TwiML — what Twilio says when call is picked up
    const twiml = `
      <Response>
        <Say voice="alice" language="en-IN">
          ${message}
        </Say>
        <Pause length="1"/>
        <Say voice="alice" language="en-IN">
          Please check the AgniSight dashboard immediately.
        </Say>
      </Response>
    `;

    const result = await twilioClient.calls.create({
      twiml: twiml,
      from:  process.env.TWILIO_FROM_NUMBER,
      to:    process.env.TWILIO_ALERT_NUMBER,
    });
    logger.info(`Call initiated: ${result.sid}`);
  } catch (err) {
    logger.error(`Twilio call error: ${err.message}`);
  }
};

// ── Activity Tracking ────────────────────────────────────────────

const recordActivity = (sessionId) => {
  sessionActivity.set(sessionId.toString(), Date.now());
};

const clearActivity = (sessionId) => {
  sessionActivity.delete(sessionId.toString());
  sentAlerts.delete(sessionId.toString());
};

// ── Alert: No Activity ───────────────────────────────────────────

const checkNoActivity = async (sessionId, io) => {
  const key  = sessionId.toString();
  const last = sessionActivity.get(key);
  if (!last) return;

  const elapsed = Date.now() - last;
  if (elapsed < NO_ACTIVITY_TIMEOUT_MS) return;

  // Don't spam — only fire once per session
  const alreadySent = sentAlerts.get(key);
  if (alreadySent?.noActivity) return;

  logger.warn(`Alert: No activity for session ${key} (${Math.round(elapsed / 1000)}s)`);

  const minutes = Math.round(elapsed / 60000);
  const message = `AgniSight Alert. No box activity detected for ${minutes} minute${minutes > 1 ? "s" : ""} in session ${key}.`;

  // Mark as sent before async calls to prevent duplicate triggers
  sentAlerts.set(key, { ...sentAlerts.get(key), noActivity: true });

  // Emit to frontend
  io.to(key).emit("alert", {
    type:      "no_activity",
    sessionId: key,
    message:   `No activity detected for ${minutes} minute(s).`,
    timestamp: new Date(),
  });

  // 📞 Phone call for no-activity (more urgent)
  await makeCall(message);
};

// ── Alert: Count Spike ───────────────────────────────────────────

const checkSpike = async (sessionId, prevCount, newCount, frameNumber, io) => {
  const key  = sessionId.toString();
  const diff = Math.abs(newCount - prevCount);
  if (diff < SPIKE_THRESHOLD) return;

  logger.warn(`Alert: Count spike in session ${key} | frame ${frameNumber} | ${prevCount} → ${newCount}`);

  const direction = newCount > prevCount ? "increased" : "decreased";
  const message   = `AgniSight Alert. Box count ${direction} suddenly from ${prevCount} to ${newCount} at frame ${frameNumber} in session ${key}.`;

  // Emit to frontend
  io.to(key).emit("alert", {
    type:      "count_spike",
    sessionId: key,
    message:   `Sudden count change: ${prevCount} → ${newCount} (${newCount > prevCount ? "+" : ""}${newCount - prevCount} boxes)`,
    frame:     frameNumber,
    prev:      prevCount,
    current:   newCount,
    timestamp: new Date(),
  });

  // 📱 SMS for spike (quick notification)
  await sendSMS(message);
};

module.exports = {
  recordActivity,
  clearActivity,
  checkNoActivity,
  checkSpike,sendSMS,
  makeCall,
};
 