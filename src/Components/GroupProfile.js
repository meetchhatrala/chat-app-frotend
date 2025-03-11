import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getCookie } from './Utils';
import { TrashIcon } from '../assets/icons/TrashIcon';
import { MembersIcon } from '../assets/icons/MembersIcon';
import { ChatIcon1 } from '../assets/icons/ChatIcon1';
import { ExitIcon } from '../assets/icons/ExitIcon';
import { IMAGE_BASE_URL } from './Config';

export const GroupProfile = (props) => {

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [profile, setprofile] = useState({})

  // Server sends profile data as: {name: 'group_name', group_admin: 'admin', image: 'group_image_url', is_admin: true/false, is_member: true/false, request_sent: true/false }

  document.title = `${profile.name} - ChatApp`

  useEffect(() => {
    if (id) {
      document.getElementById('loader').style.display = 'flex'

      axios.get(`/api/get-group-details/${id}/`, { withCredentials: true })
        .then((resp) => {
          document.getElementById('loader').style.display = 'none'
          setprofile(resp.data)
        })
        .catch((error) => {
          document.getElementById('loader').style.display = 'none'
          toast.error('Something went wrong!')
        })
    }
  }, [id])


  // For deleting or exiting the group.
  const hadleGroupAction = (type) => {
    let swalTitle, swalText, swalConfirmButtonText;
    if (type === 'exit') {
      swalTitle = 'Exit Group!'
      swalText = 'Your messages in the group will be deleted permanently.'
      swalConfirmButtonText = 'Exit Group'
    }
    else {
      swalTitle = 'Delete Group!'
      swalText = 'This will permanently delete the group.'
      swalConfirmButtonText = 'Delete Group'
    }

    Swal.fire({
      title: swalTitle,
      text: swalText,
      icon: 'warning',
      confirmButtonText: swalConfirmButtonText,
      confirmButtonColor: '#d33',
      showCancelButton: true,
      showCloseButton: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          // Sending request to the server to delete/exit the group
          document.getElementById('loader').style.display = 'flex'
          const formData = new FormData();
          formData.append('id', id)
          formData.append('tk', getCookie('tk'))
          axios({
            method: "POST",
            url: '/api/remove-connection/',
            data: formData,
            withCredentials: true,
            headers: {
              'X-CSRFToken': getCookie('csrftoken')
            },
          })
            .then((resp) => {
              document.getElementById('loader').style.display = 'none'
              if (resp.data.status) {
                // The confirmation message is handled by the notification WebSocket in "App.js".
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
      })

  }


  // For sending join request to the group
  const sendGroupRequest = () => {
    document.getElementById("loader").style.display = "flex"
    var formData = new FormData()
    formData.append('type', 'group')
    formData.append('id', id)
    formData.append('tk', getCookie('tk'))

    axios({
      method: "POST",
      url: "/api/friend-request/",
      data: formData,
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
      .then((resp) => {
        if (resp.data.send) {
          toast.success("Group request sent")
          setprofile({ ...profile, request_sent: true })
        }
        else {
          toast.error("Something went wrong!.")
        }
        document.getElementById("loader").style.display = "none"
      })
      .catch((error) => {
        document.getElementById("loader").style.display = "none"
        toast.error("Something went wrong!")
      })

  }

  return (
    <div className="account d-flex flex-column align-items-center">
      <div className="account-usr-profile my-2">
        <img src={`${IMAGE_BASE_URL}${profile.image}`} alt="profile" id="profile_pic" />
      </div>
      <div className="mb-3">
        <label htmlFor="groupname" className="form-label">Group Name</label>
        <input type="text" className="form-control" name="group_name" id="group_name" disabled value={profile.name} />
      </div>
      <div className="mb-3">
        <label htmlFor="groupadmin" className="form-label">Group Admin</label>
        <input type="text" className="form-control" name="group_name" id="group_name" disabled value={profile.group_admin} />
      </div>


      {
        profile.is_admin ? (
          <div className="px-3 d-flex justify-content-between my-5" style={{ width: '89%' }}>
            <TrashIcon width={28} height={28} color="#dc3545" onclick={() => hadleGroupAction('delete')} />

            <Link to={`/members/${id}/`}>
              <MembersIcon width={32} height={32} color="#0d6efd" />
            </Link>

            <Link to="/" state={{ chat_user: `group-${id}` }} >
              <ChatIcon1 width={33} height={33} color="#198754" />
            </Link>
          </div>

        ) : profile.is_member ? (
          <div className="px-3 d-flex justify-content-between my-5" style={{ width: '89%' }}>
            <ExitIcon width={29} height={29} color="#dc3545" onclick={() => hadleGroupAction('exit')} />
            <Link to="/" state={{ chat_user: `group-${id}` }} >
              <ChatIcon1 width={33} height={33} color="#198754" />
            </Link>
          </div>

        ) : profile.request_sent ? (
          <p className="fw-bold my-3" style={{ color: '#00b901' }} >Your group request has been sent.</p>

        ) : (
          <button className="btn btn-primary btn-sm my-4" onClick={sendGroupRequest}>Request to Join</button>
        )
      }

    </div>
  )
}
