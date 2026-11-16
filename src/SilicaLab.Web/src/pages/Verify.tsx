import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VerifyResult from "../components/certificate/VerifyResult";
import Field from "../components/ui/Field";
import Logo from "../components/ui/Logo";
import { findCertificate } from "../mocks/data";

export default function Verify() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(code ?? "");

  // TODO API: GET /api/certificates/verify/{code}
  const certificate = code ? findCertificate(code) : undefined;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = input.trim();
    if (value) navigate(`/verify/${encodeURIComponent(value)}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <Logo to="/" />

      <main id="main" className="mt-12 w-full max-w-2xl">
        <h1 className="page-title sm:text-4xl">Verify a certificate</h1>
        <p className="mt-2 text-body">Enter the certificate code below to check its official validity and details.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Certificate code" className="flex-1">
            {(control) => (
              <input
                {...control}
                className="input py-3 font-mono placeholder:font-sans"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. LH-7K2M-9QXD"
                autoComplete="off"
                spellCheck={false}
                required
              />
            )}
          </Field>
          <button type="submit" className="btn btn-primary px-8 py-3">
            Verify
          </button>
        </form>

        {code && <VerifyResult code={code} certificate={certificate} />}
      </main>
    </div>
  );
}
