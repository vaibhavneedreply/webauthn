var crypto = require("crypto");
const { generateRegistrationOptions } = require("@simplewebauthn/server");
import { withSession } from "../../../lib/session";

export default withSession(async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    const id = crypto.randomBytes(20).toString("hex");
    const { email } = req.body;
    const user = req.session.get();
    if(user[email]) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }
    const options = await generateRegistrationOptions({
      rpName: "vaibhav",
      rpID: "localhost",
      userID: id,
      userName: email,
      timeout: 60000,
      attestationType: "none",
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: "discouraged",
      },
      supportedAlgorithmIDs: [-7, -37, -257],
    });
    req.session.set(email, {
      id,
      email,
      challenge: options.challenge,
    });
    await req.session.save();
    res.status(200).json({...options, success: true});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
