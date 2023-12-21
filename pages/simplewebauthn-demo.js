import { useState } from "react";

import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import webAuthnStyles from "../styles/webauthn.module.css";

export default function WebAuthnDemo1() {
  const [query, setQuery] = useState({ email: "" });
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
      setValidationErrorMessage("email is required.");
      setIsSubmitDisabled(true);
    } else if (fieldName === "email" && !validateEmail(fieldValue)) {
      setValidationErrorMessage("Enter a valid email address!");
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

  const handleRegister = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    const response = await fetch("/api/webauthn/register-options", {
      method: "POST",
      headers: {
        "content-type": "application/Json",
      },
      body: JSON.stringify(query),
    });
    const options = await response.json();
    if (!options.success) {
      setErrorMessage(options.message ?? "Something went wrong!");
      return;
    }
    let localResponse = {};
    try {
      localResponse = await startRegistration(options)
    } catch (error) {
      setErrorMessage(options.message ?? "Something went wrong!");
      return;
    }
    const verificationResponse = await fetch("/api/webauthn/register-verify", {
      method: "POST",
      headers: {
        "content-type": "application/Json",
      },
      body: JSON.stringify({ ...localResponse, email: query.email }),
    });
    const verification = await verificationResponse.json();
    if (!verification.success) {
      setErrorMessage(verification.message ?? "Something went wrong!");
      return;
    }
    setSuccessMessage(`Registered ${query.email}! Try to authenticate...`);
    setQuery({ email: "" });
    setIsSubmitDisabled(true);
    return true;
  };

  const handleAuthentication = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    const response = await fetch("/api/webauthn/login-options", {
      method: "POST",
      headers: {
        "content-type": "application/Json",
      },
      body: JSON.stringify(query)
    });
    const options = await response.json();
    if (!options.success) {
      setErrorMessage(
        options.message ?? "login failed! Something went wrong!"
      );
      return;
    }
    const localResponse = await startAuthentication(options);
    const verificationResponse = await fetch("/api/webauthn/login-verify", {
      method: "POST",
      headers: {
        "content-type": "application/Json",
      },
      body: JSON.stringify({ ...localResponse, email: query.email }),
    });
    const { verified } = await verificationResponse.json();
    if (!verified) {
      setErrorMessage(verificationResponse.message ?? "login failed! Something went wrong!");
      return;
    }
    setSuccessMessage(`You're logged in ${query.email}!`);
    setQuery({ email: "" });
    setIsSubmitDisabled(true);
    return true;
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
          {successMessage && (
            <span className={webAuthnStyles.sucessSpan}>{successMessage}</span>
          )}
          {errorMessage && (
            <span className={webAuthnStyles.errorSpan}>{errorMessage}</span>
          )}
        </section>
      </div>
    </div>
  );
}
