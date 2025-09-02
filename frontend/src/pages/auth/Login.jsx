 import React, { useState } from "react";
 import "./auth.css"; 
 import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { CourseData } from "../../context/CourseContext";

 const Login = () => {
  const navigate = useNavigate()
  const{ btnloading, loginUser } = UserData()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const {  fetchMyCourse } = CourseData()

  const SubmitHandler=async(e)=>{
    e.preventDefault();
    await loginUser(email, password, navigate, fetchMyCourse);
  };
   return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={SubmitHandler}>
          <label htmlFor="email">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} requiredrequired />

          <button disabled={btnloading} type="submit" className="common-btn">
            {btnloading?"Please Wait...": "Login"}
          </button>

        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
   );
 };
 
 export default Login