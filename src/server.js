const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { sendSMS } = require("./smsProvider");

const app = express();
app.use(bodyParser.json());

app.post("/onBeforeSendSMS", async (req, res) => {
  try {
    console.log("========== RAW CDC REQUEST ==========");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=====================================");

    let payload;

    // ✅ CASE 1: CDC sends JWS (SIGNED PAYLOAD)
    if (req.body.jws) {
      const decoded = jwt.decode(req.body.jws, { complete: true });

      if (!decoded || !decoded.payload) {
        throw new Error("Unable to decode CDC JWS payload");
      }

      payload = decoded.payload;
      console.log("========== DECODED JWS PAYLOAD ==========");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=========================================");
    }

    // ✅ CASE 2: CDC sends plain payload (older tenants)
    else {
      payload = req.body.data ? req.body.data : req.body;
    }

    const phoneNumber = payload.phoneNumber;
    const code = payload.code;
    const message = payload.message;

    if (!phoneNumber || !code) {
      throw new Error("Missing phoneNumber or code in CDC payload");
    }

    console.log("========== NORMALIZED DATA ==========");
    console.log("Phone:", phoneNumber);
    console.log("Code:", code);
    console.log("Message:", message);
    console.log("====================================");

    await sendSMS(phoneNumber, message);

    return res.status(200).json({ status: "OK" });

  } catch (error) {
    console.error("❌ OnBeforeSendSMS Error:", error.message);

    return res.status(200).json({
      status: "FAIL",
      data: {
        userFacingErrorMessage: "SMS delivery failed"
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ CDC SMS Extension listening on port ${PORT}`);
});
