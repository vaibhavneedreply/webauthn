const { verifyAuthenticationResponse } = require("@simplewebauthn/server");
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { withSession } from "../../../lib/session";

export default withSession(async function handler(req, res) {
  try {
    const { email } = req.body;
    const user = req.session.get();
    const expectedChallenge = user[email].challenge;
    const dbAuthenticator = user[email].device.find(
      (dev) => dev.credentialID === req.body.rawId
    );
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: "http://localhost:3000",
      expectedRPID: "localhost",
      authenticator: {
        ...dbAuthenticator,
        credentialID: isoBase64URL.toBuffer(dbAuthenticator.credentialID),
        credentialPublicKey: isoBase64URL.toBuffer(
          dbAuthenticator.credentialPublicKey
        ),
      },
      requireUserVerification: true,
    });
    res.status(200).json(verification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
