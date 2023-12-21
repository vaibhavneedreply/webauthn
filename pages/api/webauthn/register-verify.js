const { verifyRegistrationResponse } = require("@simplewebauthn/server");
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { withSession } from "../../../lib/session";

export default withSession(async function handler(req, res) {
  try {
    const { email } = req.body;
    const user = req.session.get();
    const expectedChallenge = user[email].challenge;
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
      requireUserVerification: false,
    });
    const { verified, registrationInfo } = verification;
    if (!verified || !registrationInfo) {
      res.status(400).json({
        success: false,
        message: 'Registration failed'
      });
    }
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    const newDevice = {
      credentialPublicKey: isoBase64URL.fromBuffer(credentialPublicKey),
      credentialID: isoBase64URL.fromBuffer(credentialID),
      counter,
      transports: req.body.response.transports
    };
    req.session.set(email, {
      ...user[email],
      device: [newDevice]
    });
    await req.session.save();
    res.status(200).json({success: true});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
