import { ArrowRight, Award, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/ui/Logo";

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Logo to="/" />
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-7xl flex-1 items-center gap-12 px-6 py-12"
      >
        <div className="max-w-2xl">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Learn <span className="text-accent">new skills</span>
            <br />
            Prove them with a certificate.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-body">
            LearnHub is where teachers publish courses and students learn at
            their own pace, pass an exam and receive a certificate that anyone
            can verify.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get started
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Log in
            </Link>
            <Link to={`/verify`} className="btn btn-secondary btn-lg">
              <ExternalLink size={16} /> Verify your certificate
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden flex-1 justify-center lg:flex"
        >
          <div className="w-80 rotate-3 rounded-2xl bg-white p-7 shadow-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Award size={26} />
            </span>
            <p className="eyebrow mt-5">Certificate of completion</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">
              Anna Kowalska
            </p>
            <p className="mt-1 text-sm text-muted">
              Introduction to C# and .NET
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
              <span>Score 92%</span>
              <span className="font-mono font-semibold text-accent-dark">
                LH-7K2M-9QXD
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
