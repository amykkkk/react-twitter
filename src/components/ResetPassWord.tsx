import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Form, Input, Title, Wrapper, Error } from "./auth-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

export default function ResetPassWord() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isLoading || email === "") return;
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Reset Password 𝕏</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Reset Password"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
    </Wrapper>
  );
}
