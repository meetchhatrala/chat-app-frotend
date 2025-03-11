import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { getCookie } from './Utils'
import { IMAGE_BASE_URL } from './Config'

export const Account = (props) => {

  const [profile, setprofile] = useState({ first_name: '', last_name: '', email: '', })
  const [editClicked, seteditClicked] = useState(false)

  document.title = "Account - ChatApp"



  useEffect(() => {
    const formData = new FormData()
    formData.append('tk', getCookie('tk'))

    document.getElementById('loader').style.display = 'flex'

    axios({
      method: "POST",
      url: '/api/get-account-details/',
      data: formData,
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
      .then((resp) => {
        document.getElementById('loader').style.display = 'none'
        setprofile(resp.data)
      })
      .catch((error) => {
        toast.error("Something went wrong!")
        document.getElementById('loader').style.display = 'none'
      })
  }, [])


  const submit_form = (e) => {
    e.preventDefault();

    document.getElementById('loader').style.display = 'flex'

    const form = document.getElementById('update_details_form')
    const formData = new FormData(form)
    formData.append('tk', getCookie('tk'))

    axios({
      method: "POST",
      url: '/api/update-account-details/',
      withCredentials: true,
      data: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
      .then((resp) => {
        document.getElementById('loader').style.display = 'none'
        if (resp.data.updated) {
          toast.success("Profile details updated.")
          setprofile({ ...profile, first_name: formData.get('first_name'), last_name: formData.get('last_name') })
        }
        else {
          toast.error("Something went wrong!")
        }
      })
      .catch((error) => {
        toast.error("Something went wrong!")
        document.getElementById('loader').style.display = 'none'
      })

    edit_form();
  }

  const edit_form = () => {
    var firstname = document.getElementById('first_name')
    var lastname = document.getElementById('last_name')
    var upload_img = document.getElementById('upload_img')
    firstname.toggleAttribute('disabled')
    lastname.toggleAttribute('disabled')
    upload_img.classList.toggle('d-none')
    if (editClicked) {
      seteditClicked(false)
    }
    else {
      seteditClicked(true)
    }
  }

  const edit_name = (e) => {
    var value = e.target.value
    var name = e.target.id
    if (name === 'first_name') {
      setprofile({ ...profile, first_name: value })
    }
    else {
      setprofile({ ...profile, last_name: value })
    }
  }

  // Preview selected profile image
  const preview_img = () => {
    const input_img = document.getElementById('image')
    const profile_pic = document.getElementById('profile_pic')

    const file = input_img.files[0]

    if (file) {

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];  // Allowed image types
      const maxFileSizeInBytes = 3 * 1024 * 1024; // 3 MB

      if (allowedTypes.includes(file.type) && file.size <= maxFileSizeInBytes) {

        const reader = new FileReader();
        reader.onload = function (e) {
          profile_pic.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
      else {
        toast.warning('Please select a valid image within 3MB in size.');
        input_img.value = ''; // Clear the input to allow selecting another file.
        profile_pic.src = profile.image
      }
    }
  }

  return (
    <div className="account d-flex flex-column">
      <form onSubmit={submit_form} className="d-flex flex-column justify-content-center align-items-center" id="update_details_form">
        <div className="account-usr-profile">
          <img src={`${IMAGE_BASE_URL}${profile.image}`} alt="profile" id="profile_pic" />
        </div>
        <div className="account-usr-details mt-4">
          <div className="mb-3 d-none" id="upload_img">
            <label htmlFor="image" className="form-label">Select Profile Picture</label>
            <input type="file" name="image" className="form-control" accept=".png, .jpg, .jpeg, .gif" id="image" onChange={preview_img} />
            <p className="mx-auto">Image size should be less than 3MB.</p>
          </div>
          <div className="mb-3">
            <label htmlFor="firstname" className="form-label">Firstname</label>
            <input type="text" className="form-control" name="first_name" id="first_name" minLength="3" disabled required value={profile.first_name} onChange={edit_name} />
          </div>
          <div className="mb-3">
            <label htmlFor="lastname" className="form-label">Lastname</label>
            <input type="text" className="form-control" name="last_name" id="last_name" minLength="3" required disabled value={profile.last_name} onChange={edit_name} />
          </div>
          <div className="mb-3">
            <label htmlFor="Email" className="form-label">Email</label>
            <input type="text" className="form-control" disabled name="email" id="Email" value={profile.email} required />
          </div>

          {
            editClicked && (
              <button type="submit" className="btn btn-primary btn-sm float-end col-5 mx-1 my-3">Save Changes</button>
            )
          }
        </div>
      </form>
      {
        !editClicked && (
          <button type="button" className="btn btn-primary btn-sm col-3 ms-auto me-5 my-3" onClick={edit_form}>Edit</button>
        )
      }
    </div>
  )
}
