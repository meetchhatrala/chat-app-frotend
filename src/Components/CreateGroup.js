import React from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getCookie } from './Utils'
import { IMAGE_BASE_URL } from './Config'

export const CreateGroup = (props) => {

  const navigate = useNavigate();

  document.title = "CreateGroup - ChatApp"

  const handleSubmit = (e) => {
    e.preventDefault();
    document.getElementById('loader').style.display = 'flex'

    const form = document.getElementById('create-group-form')
    const formData = new FormData(form)
    formData.append('tk', getCookie('tk'))

    axios({
      method: "POST",
      url: '/api/create-group/',
      data: formData,
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
      .then((resp) => {
        document.getElementById('loader').style.display = 'none'
        if (resp.data.created) {
          toast.success('Group Created.')
          // Adding the newly created group to the "group_lists" array within the "friends" state in App.js
          props.setfriends((prevFriends) => ({
            ...prevFriends,
            groups_list: [...prevFriends.groups_list, resp.data]
          }))
          navigate('/')
        }
        else {
          toast.error('Something went wrong!')
        }
      })
      .catch((error) => {
        toast.error('Something went wrong!')
        document.getElementById('loader').style.display = 'none'
      })
  }

  // Preview selected profile image
  const preview_img = () => {
    const input_img = document.getElementById('image')
    const group_pic = document.getElementById('group_pic')

    const file = input_img.files[0]

    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];  // Allowed image types
      const maxFileSizeInBytes = 3 * 1024 * 1024; // 3 MB

      if (allowedTypes.includes(file.type) && file.size <= maxFileSizeInBytes) {
        const reader = new FileReader();
        reader.onload = function (e) {
          group_pic.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
      else {
        toast.warning('Please select a valid image within 3MB in size.');
        input_img.value = ''; // Clear the input to allow selecting another file.
      }
    }
  }

  return (
    <div className="create-group">
      <h2 className="text-center mt-1 mb-4">Create Group</h2>
      <form id="create-group-form" className="my-4 d-flex flex-column justify-content-center align-items-center" onSubmit={handleSubmit}>
        <div className="group-profile mb-4">
          <img src={`${IMAGE_BASE_URL}/media/profile_pictures/default_profile.jpg`} alt="img" id="group_pic" />
        </div>
        <div className="mb-3" id="upload_img">
          <label htmlFor="image" className="form-label">Select Group Image</label>
          <input type="file" name="image" className="form-control" accept=".png, .jpg, .jpeg, .gif" id="image" onChange={preview_img} />
          <p className="mx-auto">Image size should be less than 3MB.</p>
        </div>
        <div className="mb-3">
          <label htmlFor="group_name" className="form-label">Group Name</label>
          <input type="text" className="form-control" name="group_name" id="group_name" placeholder="Enter group name" required />
        </div>
        <button type="submit" className="btn btn-primary btn-sm my-2 mx-2">Create Group</button>
      </form>
    </div>
  )
}
