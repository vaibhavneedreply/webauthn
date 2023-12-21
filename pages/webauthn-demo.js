const crypto    = require('crypto');
import { useState } from "react";
import webAuthnStyles from "../styles/webauthn.module.css";

export default function WebAuthnDemo() {
  const [query, setQuery] = useState({
    email: "",
  });
  const [validationErrorMessage, setValidationErrorMessage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInput = (e) => {
    setSuccessMessage("");
    setErrorMessage("");
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setQuery((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    if (fieldValue.trim() === "") {
      setValidationErrorMessage("Email is required.");
      setIsSubmitDisabled(true);
    } else if (fieldName === "email" && !validateEmail(fieldValue)) {
      setValidationErrorMessage("Please enter a valid email address.");
      setIsSubmitDisabled(true);
    } else {
      setValidationErrorMessage("");
      setIsSubmitDisabled(false);
    }
  };

  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };

  let randomBase64URLBuffer = (len) => {
    len = len || 32;
    let buff = crypto.randomBytes(len);
    return base64url(buff);
  }


  const handleRegister = async () => {
    try {
      const response = await fetch("/api/webauthn/register", {
        method: "POST",
        body: JSON.stringify(query),
      });
      const data = await response.json();
      const registerBody = {
        ...data,
        user: {
          ...data.user,
          id: new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]),
        },
        challenge: randomBase64URLBuffer(32),
      };
      const credential = await navigator.credentials.create({
        publicKey: registerBody,
      });
      const credentialToStore = {
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          attestationObject: Array.from(
            new Uint8Array(credential.response.attestationObject)
          ),
          clientDataJSON: Array.from(
            new Uint8Array(credential.response.clientDataJSON)
          ),
        },
        authenticatorAttachment: credential.authenticatorAttachment,
        id: credential.id,
        type: credential.type,
      };
      localStorage.setItem(
        "webAuthnCredentials",
        JSON.stringify(credentialToStore)
      );
      setSuccessMessage(`Registered ${query.email}! Try to authenticate...`);
      setQuery({ email: "" });
      setIsSubmitDisabled(true);
      return true;
    } catch (error) {
      setErrorMessage("Error during registration! Try again...");
      console.error("Error during registration:", error);
    }
  };

  const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  const handleAuthentication = async () => {
    try {
      const parsedCredential = JSON.parse(localStorage.getItem("webAuthnCredentials"));
      const options = {
        publicKey: {
          challenge: new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]),
          allowCredentials: [
            {
              type: parsedCredential.type,
              id: new Uint8Array(parsedCredential.rawId),
            },
          ],
        },
      };


      const credential = await navigator.credentials.get(options);
      const receivedChallenge = new Uint8Array(credential.response.clientDataJSON);
      const expectedChallenge = new Uint8Array(parsedCredential.response.clientDataJSON);
      if(arraysEqual(receivedChallenge, expectedChallenge)) {
        console.log('its herer');
      } else {
        console.log('its not herer');
      }

      // if (!credential) {
      //   setErrorMessage("Authentication failed or no credential obtained...");
      //   return;
      // }
      // const publicKey = options.publicKey;
      // const expectedChallenge = new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]);
      // const expectedAllowCredentials = publicKey.allowCredentials;

      // if (credential.response.clientDataJSON && credential.rawId) {
      //   const { response, rawId } = credential;
      //   const clientDataJSON = new Uint8Array(response.clientDataJSON);
      //   const { challenge } = JSON.parse(new TextDecoder().decode(clientDataJSON));
      //   const receivedChallengeArray = new TextEncoder().encode(challenge);
      //   const receivedChallenge = new Uint8Array(receivedChallengeArray);

      //   console.log(expectedChallenge, "expectedChallenge");
      //   console.log(receivedChallenge, "receivedChallenge");
      //   if (receivedChallenge === expectedChallenge) {
      //     const receivedCredentialId = new Uint8Array(rawId).toString();
      //     const isCredentialAllowed = expectedAllowCredentials.some(
      //       ({type, id}) =>
      //         cred.type === credential.type && cred.id === receivedCredentialId
      //     );
      //     if (isCredentialAllowed) {
      //       console.log("Credential is valid!");
      //     } else {
      //       console.error("Invalid credential ID!");
      //     }
      //   } else {
      //     console.error("Invalid challenge or RPID!");
      //   }
      // } else {
      //   console.error("Invalid response data in obtained credential.");
      // }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <header className={webAuthnStyles.header}>
        <h1>Web Authenticate - WebAuthn Demo</h1>
      </header>
      <div className={webAuthnStyles.main}>
        <section className={webAuthnStyles.section}>
          <div className={webAuthnStyles.box}>
            {validationErrorMessage && (
              <span className={webAuthnStyles.span}>
                {validationErrorMessage}
              </span>
            )}
            <input
              type="text"
              name="email"
              required
              placeholder="Email"
              className={webAuthnStyles.formControl}
              value={query.email}
              onChange={handleInput}
            />
            <button
              className={webAuthnStyles.button}
              onClick={handleRegister}
              disabled={isSubmitDisabled}
            >
              Register
            </button>
            <button
              className={webAuthnStyles.button}
              onClick={handleAuthentication}
              disabled={isSubmitDisabled}
            >
              Authenticate
            </button>
          </div>
        </section>
        <section className={webAuthnStyles.section}>
          {successMessage && (
            <span className={webAuthnStyles.sucessSpan}>{successMessage}</span>
          )}
          {errorMessage && (
            <span className={webAuthnStyles.sucessSpan}>{errorMessage}</span>
          )}
        </section>
      </div>
    </div>
  );
}
