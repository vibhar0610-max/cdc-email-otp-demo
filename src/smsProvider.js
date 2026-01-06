async function sendSMS(phone, message) {
  console.log("---- SIMULATED SMS ----");
  console.log("To:", phone);
  console.log("Message:", message);
  console.log("----------------------");

  // Simulate success
  return true;
}

module.exports = { sendSMS };
