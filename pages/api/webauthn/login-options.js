const { generateAuthenticationOptions } = require("@simplewebauthn/server");
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { withSession } from "../../../lib/session";

export default withSession(async function handler(req, res) {
  try {
    const { email } = req.body;
    let user = req.session.get();
    if(!user[email]) {
      res.status(400).json({
        success: false,
        message: 'User does not exists',
      });
    }
    const options = await generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials: user[email].device.map((dev) => ({
        id: isoBase64URL.toBuffer(dev.credentialID),
        type: "public-key",
        transports: dev.transports,
      })),
      userVerification: "required",
      rpID: 'localhost',
    });
    user[email].challenge = options.challenge;
    req.session.set(email, {...user[email]});
    await req.session.save();
    res.status(200).json({...options, success: true});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
