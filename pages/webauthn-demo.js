import { useState } from "react";
import webAuthnStyles from "../styles/webauthn.module.css";

export default function WebAuthnDemo() {
  const [registrationOptions, setRegistrationOptions] = useState(null);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [query, setQuery] = useState({
    email: "",
  });
  const [validationErrorMessage, setValidationErrorMessage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInput = async (e) => {
    setSuccessMessage('');
    setSuccessMessage('');
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
          id: new Uint8Array(16),
        },
        challenge: new Uint8Array(32),
      };
      setRegistrationOptions(registerBody);
      await startWebAuthnRegistration(registerBody);
    } catch (error) {
      setErrorMessage("Error during registration! Try again...");
      console.error("Error during registration:", error);
    }
  };

  const startWebAuthnRegistration = async (registerBody) => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: registerBody,
      });
      setRegistrationResult(credential);
      setSuccessMessage(
        `Successfully registered ${query.email}! Try to authenticate...`
      );
      setQuery({ email: "" });
      setIsSubmitDisabled(true);
      // await sendCredentialToServer(credential);
    } catch (error) {
      setErrorMessage("Error during registration! Try again...");
      console.error("Error during WebAuthn registration:", error);
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
