import { useState, useContext } from "react";
import Authlayout from "../../components/layout/Authlayout";
import ProfilePhotoSelector from "../../components/inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/input";
import { Link, useNavigate } from "react-router-dom";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { UserContext } from "../../context/useContext";
import uploadImage from "../../utils/uploadImage";

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  //handle signup
  const handleSignup = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    if (!fullName.trim()) {
      setError("Please Enter a full name");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please Enter the valid email");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError(null);

    // Signup api calling
    try {
      setIsSubmitting(true);
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }
      const response = await Axiosinstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("Token", token);
        updateUser(response.data);

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/users/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Authlayout variant="signup">
      <section className="auth-signup-card" aria-labelledby="signup-heading">
        <p className="auth-signup-eyebrow">GET STARTED</p>
        <h3 id="signup-heading" className="auth-signup-title">
          Create your account
        </h3>
        <p className="auth-signup-description">
          Set up your details and get your workspace ready.
        </p>

        <form className="auth-signup-form" onSubmit={handleSignup}>
          <div className="auth-signup-profile">
            <div>
              <p className="auth-signup-profile-title">Profile photo</p>
              <p className="auth-signup-profile-hint">
                Optional. You can add one later.
              </p>
            </div>
            <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          </div>

          <div className="auth-signup-grid">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John"
              type="text"
              autoComplete="name"
              required
            />

            <Input
              type="email"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              autoComplete="email"
              required
            />

            <Input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              placeholder="Enter your password"
              autoComplete="new-password"
              required
            />

            <Input
              type="text"
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token"
              placeholder="Enter the admin invite token (optional)"
            />
          </div>

          {error && (
            <p className="auth-login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
          <p className="auth-signup-login">
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </Authlayout>
  );
};

export default Signup;
