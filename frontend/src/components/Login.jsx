import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import SidePanel from "./SidePanel";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = ({ setIsAuthenticated }) => {
  const { loginUser, authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(true);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = {};
    setErrors({});

    if (!email) {
      validationErrors.email = "Email or Phone is required.";
    }
    if (!password) {
      validationErrors.password = "Password is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const { token, role } = await loginUser({ email, password });

        localStorage.setItem("token", token);
        setIsAuthenticated(true); // Set authenticated state to true
        toast.success("Login successfully!");
        if (role === "admin") {
          navigate(`/${role}/dashboard`);
        } else if (role === "doctor") {
          navigate(`/${role}/dashboard`);
        } else if (role === "patient") {
          navigate("/patient");
        }else if(role==="receptionist"){
          navigate(`/${role}/dashboard`)
        } else {
          navigate("/home");
        }
      } catch (error) {
        toast.error("Login failed. Please try again.");
        setErrors({ password: authError || "Login failed, try again" });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex justify-center items-center bg-white p-10">
        <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                type="text"
                id="email"
                name="email"
                className={`peer w-full px-4 py-2 border border-gray-300 rounded-xl  focus:outline-none focus:ring-0  ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter Email or Phone Number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] transition-all duration-200  peer-focus:-top-2.5 peer-focus:left-3"
              >
                Email or Phone<span className="text-red-500">*</span>
              </label>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative mb-4">
              <input
                type={showPassword ? "password" : "text"}
                id="password"
                name="password"
                className={`peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label
                htmlFor="password"
                className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229]  transition-all duration-200 peer-focus:-top-2.5 peer-focus:left-3"
              >
                Password<span className="text-red-500">*</span>
              </label>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="text-gray-500" />
                ) : (
                  <AiOutlineEye className="text-gray-500" />
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-sm">
                  Remember me
                </label>
              </div>
              <Link
                to={"/forgot-password"}
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-2  bg-[#f6f8fb] text-[#4f4f4f] rounded-xl hover:bg-[#0eabeb] hover:text-white transition duration-200"
            >
              Login
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            Don’t have an account?{" "}
            <Link to={"/patient-registration"} className="text-blue-500 hover:underline">
              Registration
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden md:flex md:w-1/2">
        <SidePanel />
      </div>
    </div>
  );
};

export default Login;
