import { FiCheck } from "react-icons/fi";

const Authlayout = ({ children, variant }) => {
  const isLogin = variant === "login";
  const isSignup = variant === "signup";
  const isBranded = isLogin || isSignup;

  return (
    <div className={isBranded ? `auth-shell auth-shell--${variant}` : "flex"}>
      {isBranded ? (
        <div className="auth-shell-main">
          <aside className="auth-story">
            <div className="auth-story-top">
              <h2 className="auth-login-brand">
                <span className="auth-login-brand-mark" aria-hidden="true">
                  <FiCheck />
                </span>
                Task Manager
              </h2>
              <span className="auth-story-tag">Team workspace</span>
            </div>
            <div className="auth-story-content">
              <p className="auth-story-eyebrow">MAKE ROOM FOR WHAT MATTERS</p>
              <h1>
                Good work
                <br />
                moves forward.
              </h1>
              <p className="auth-story-copy">
                A little more clarity. A little less noise. Your team, in
                rhythm.
              </p>
            </div>
            <p className="auth-story-footer">
              Thoughtful work starts here <span aria-hidden="true">·</span>{" "}
              {new Date().getFullYear()}
            </p>
          </aside>
          <section className="auth-form-panel">
            <h2 className="auth-login-brand auth-mobile-brand">
              <span className="auth-login-brand-mark" aria-hidden="true">
                <FiCheck />
              </span>
              Task Manager
            </h2>
            <main className={isLogin ? "auth-login-main" : "auth-signup-main"}>
              {children}
            </main>
          </section>
        </div>
      ) : (
        <>
          <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
            <h2 className="text-lg font-medium text-black">Task Manager</h2>
            {children}
          </div>
          <div className="hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 bg-cover bg-no-repeat bg-center overflow-hidden" />
        </>
      )}
    </div>
  );
};

export default Authlayout;
