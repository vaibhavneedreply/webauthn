export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const registrationOptions = generateRegistrationOptions(JSON.parse(req.body));
  res.status(200).json(registrationOptions);
}

function generateRegistrationOptions({email}) {
  const rp = {
    id: 'localhost',
    name: "vaibhav"
  };
  const pubKeyCredParams = [
    { type: "public-key", alg: -7 }
    // { type: "public-key", alg: -37 },
    // { type: "public-key", alg: -257 },
  ];
  const authenticatorSelection = {
    // authenticatorAttachment: 'platform',
    requireResidentKey: false,
    userVerification: "preferred",
  };
  const timeout = 60000;
  const user = {
    name: email,
    displayName: email.split("@")[0],
  };
  return {
    rp,
    pubKeyCredParams,
    authenticatorSelection,
    user,
    timeout,
    extensions: {
      credProps: true
    }
  };
}
