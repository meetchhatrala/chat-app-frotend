import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCookie } from './Utils';


export const Login = (props) => {

  axios.defaults.withCredentials = true;
  document.title = "Login - ChatApp"

  const navigate = useNavigate();

  useEffect(() => {
    if (props.authenticated) {
      navigate('/')
    }
  }, [navigate, props.authenticated])


  const handleLogin = (e) => {
    e.preventDefault();
    document.getElementById("loader").style.display = "flex"
    const loginForm = document.getElementById('login-form')
    const formData = new FormData(loginForm)

    axios({
      method: "POST",
      url: '/api/login/',
      withCredentials: true,
      data: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
      .then((resp) => {
        document.getElementById("loader").style.display = "none"

        if (resp.data.authenticated) {
          // 1 day = 24*60*60 = 86400    * 28 days = 2419200
          document.cookie = `tk=${resp.data.token}; max-age=2419200; path=/; sameSite=None; secure=true;`;

          props.setauthenticated(resp.data.authenticated)
          toast.success("Successfully loggedin")
        }
        else {
          toast.error("Invalid Credentials")
        }
      })
      .catch((error) => {
        document.getElementById("loader").style.display = "none"
        toast.error("Something went wrong!")
      })
  }


  return (
    <>

      <nav className="navbar navbar-expand-lg">
        <p className="h3 m-auto glow-text fw-bold">ChatApp</p>
      </nav>

      <div className="login-page m-auto mt-5">
        <h2 className="text-center my-2">Login</h2>
        <form id="login-form" className="my-4" onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="loginmail" className="form-label">Email address</label>
            <input type="email" className="form-control" name="email" id="loginmail" required />
          </div>
          <div className="mb-3">
            <label htmlFor="loginpass" className="form-label">Password</label>
            <input type="password" className="form-control" name="password" id="loginpass" autoComplete="on" required />
          </div>
          <p className="text-center mb-3">Don't have an account? <Link to="/signup/">Create account</Link></p>
          <div className="row">
            <button type="submit" className="btn btn-primary btn-sm col-4 mx-auto my-2">Login</button>
          </div>
        </form>
      </div>

    </>
  )
}
