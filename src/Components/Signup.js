import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { getCookie } from './Utils'

export const Signup = (props) => {

  document.title = "SignUp - ChatApp"

  const navigate = useNavigate();

  useEffect(() => {
    if (props.authenticated) {
      navigate('/')
    }
  }, [props.authenticated, navigate])

  const handleSubmit = (e) => {
    e.preventDefault();
    document.getElementById('loader').style.display = "flex"
    const form = document.getElementById('signup-form')
    const formData = new FormData(form)

    if (formData.get('password1') !== formData.get('password2')) {
      toast.error("Passwords do not match");
      document.getElementById('loader').style.display = "none"
      return;
    }

    axios({
      method: 'POST',
      url: '/api/signup/',
      data: formData,
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
      .then((resp) => {
        document.getElementById('loader').style.display = "none"
        if (resp.data.authenticated) {
          document.cookie = `tk=${resp.data.token}; max-age=2419200; path=/; sameSite=None; secure=true;`;
          props.setauthenticated(true)
          toast.success("Your account has been created.")
        } else {
          toast.error(resp.data.error)
        }
      })
      .catch((error) => {
        document.getElementById('loader').style.display = "none"
        toast.error("Something went wrong!")
      })
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <p className="h3 m-auto glow-text fw-bold">ChatApp</p>
      </nav>
      <div className="signup-page m-auto">
        <h1 className="text-center my-3">Signup</h1>
        <form id="signup-form" onSubmit={handleSubmit} className="my-4">
          <div className="mb-3">
            <label htmlFor="first_name" className="form-label">Enter your name</label>
            <input type="text" name="first_name" className="form-control" id="first_name" required />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" id="email" aria-describedby="emailHelp" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password1" className="form-label">Enter Password</label>
            <input type="password" autoComplete="on" name="password1" className="form-control" id="password1" required minLength="8" />
          </div>
          <div className="mb-3">
            <label htmlFor="password2" className="form-label">Confirm Password</label>
            <input type="password" autoComplete="on" name="password2" className="form-control" id="password2" required minLength="8" />
          </div>
          <p className="text-center mb-3">Already have an account? <Link to="/login/">Login Here</Link></p>
          <div className="row">

            <button type="submit" className="btn btn-primary btn-sm my-1 col-3 mx-auto mb-3">Signup</button>
          </div>
        </form>
      </div>
    </>
  )
}
