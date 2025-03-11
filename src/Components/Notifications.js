import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getCookie } from './Utils';
import { RejectIcon } from '../assets/icons/RejectIcon';
import { AcceptIcon } from '../assets/icons/AcceptIcon';
import { IMAGE_BASE_URL } from './Config';


export const Notifications = (props) => {

  let friend_requests = props.user_notifications.friend_requests
  let group_requests = props.user_notifications.group_requests

  document.title = "Notifications - ChatApp"


  const handleGroupRequest = (type, req_id) => {
    const formData = new FormData();
    formData.append('type', type)
    formData.append('id', req_id)
    formData.append('tk', getCookie('tk'))

    if (type === 'accept') {
      sendGroupRequestToServer(formData)
    }
    else {
      Swal.fire({
        title: 'Reject Request!',
        text: 'Reject group joining request?',
        icon: 'warning',
        confirmButtonText: 'Reject',
        confirmButtonColor: '#d33',
        showCancelButton: true,
        showCloseButton: true,
      })
        .then((result) => {
          if (result.isConfirmed) {
            sendGroupRequestToServer(formData)
          }
        })
    }
  }

  const sendGroupRequestToServer = (data) => {
    document.getElementById('loader').style.display = 'flex'
    axios({
      method: 'POST',
      url: '/api/handle-group-request/',
      data: data,
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      },
    })
      .then((resp) => {
        document.getElementById('loader').style.display = 'none'
        if (resp.data.status) {
          if (data.get('type') === 'accept') {
            toast.success("Successfully added the user to group")
          }
          else {
            toast.success("Group request rejected")
          }
          // Removing the user's group joining request from notifications
          const new_data = group_requests.filter(req => {
            return parseInt(req.group_req_id) !== parseInt(data.get('id'))
          })
          props.setuser_notifications({ ...props.user_notifications, 'group_requests': new_data })
        }
      })
      .catch((error) => {
        document.getElementById('loader').style.display = 'none'
        toast.error("Something went wrong!")
      })
  }


  // For accepting/rejecting friend request
  const handleFriendRequest = (type, id) => {
    const formData = new FormData();
    formData.append('type', type)
    formData.append('id', id)
    formData.append('tk', getCookie('tk'))

    if (type === 'accept') {
      sendFriendRequestToServer(formData)
    }
    else {
      Swal.fire({
        title: 'Reject Request!',
        text: 'Reject friend request?',
        icon: 'warning',
        confirmButtonText: 'Reject',
        confirmButtonColor: '#d33',
        showCancelButton: true,
        showCloseButton: true,
      })
        .then((result) => {
          if (result.isConfirmed) {
            sendFriendRequestToServer(formData)
          }
        })
    }
  }

  // Send request to server
  const sendFriendRequestToServer = (data) => {
    document.getElementById('loader').style.display = 'flex'
    axios({
      method: 'POST',
      url: '/api/handle-request/',
      data: data,
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      },
    })
      .then((resp) => {
        document.getElementById('loader').style.display = 'none'
        if (resp.data.status) {
          var user_id = data.get('id')
          if (data.get('type') === 'accept') {
            toast.success("Friend request accepted")
            // Adding user details to 'props.setfriends'(app.js) if user accepted friend request
            var user = friend_requests.filter(req => parseInt(req.id) === parseInt(user_id))
            props.setfriends((prevFriends) => ({
              ...prevFriends,
              friends_list: [...prevFriends.friends_list, user[0]]
            }))
          }
          else {
            toast.success("Friend request rejected")
          }
          // Remove the user friend request from notifications
          var new_data = friend_requests.filter((req) => {
            return parseInt(req.id) !== parseInt(user_id)
          })
          props.setuser_notifications({ ...props.user_notifications, 'friend_requests': new_data })

        }
      })
      .catch((error) => {
        document.getElementById('loader').style.display = 'none'
        toast.error("Something went wrong!")
      })
  }


  return (
    <div className="notifications">

      {
        friend_requests.length > 0 && (
          <>
            <p className="search-usr-type fw-bold">Friend Requests</p>
            {
              friend_requests.map((req) => {
                return (
                  <div className="notification d-flex align-items-center justify-content-evenly" key={`friend_req_${req.id}`}>
                    <Link to='/user-profile/' state={{ id: req.id }}  >
                      <img src={`${IMAGE_BASE_URL}${req.image}`} alt="profile" className="ms-2" />
                    </Link>
                    <div className="notification-user-details ms-2">
                      <p className="notification-user-name fw-bold">{req.name.slice(0, 18)}</p>
                      <p>{req.email.slice(0, 16)}</p>
                    </div>
                    <div className="notification-options ms-2">

                      <RejectIcon width={29} height={29} color="#dc3545" onclick={() => handleFriendRequest('reject', req.id)} />

                      <AcceptIcon width={29} height={29} color="#00b901" onclick={() => handleFriendRequest('accept', req.id)} />
                    </div>
                  </div>
                )
              })
            }
          </>
        )
      }



      {
        group_requests.length > 0 && (

          <>

            <p className="search-usr-type fw-bold">Group Requests</p>

            {
              group_requests.map((req) => {
                return (

                  <div className="notification d-flex align-items-center justify-content-evenly" key={`group_req_${req.group_req_id}`} >
                    <Link to='/group-profile/' state={{ id: req.group_id }}  >
                      <img src={`${IMAGE_BASE_URL}${req.group_image}`} alt="profile" className="ms-2" />
                    </Link>
                    <div className="notification-user-details ms-2 d-flex flex-column  align-items-center justify-content-center">
                      <p className="fw-bold">{req.group_name.slice(0, 18)}</p>
                      <Link to='/user-profile/' state={{ id: req.user_id }} className='text-decoration-none' >
                        <p className='fw-bold text-decoration-none'>{req.username.slice(0, 16)} <span style={{ transform: 'scaleY(2)', display: 'inline-block', height: '1.7rem' }}>&gt;</span> </p>
                      </Link>
                    </div>
                    <div className="notification-options ms-2">

                      <RejectIcon width={29} height={29} color="#dc3545" onclick={() => handleGroupRequest('reject', req.group_req_id)} />

                      <AcceptIcon width={29} height={29} color="#00b901" onclick={() => handleGroupRequest('accept', req.group_req_id)} />
                    </div>
                  </div>

                )
              })

            }
          </>

        )
      }

      {
        friend_requests.length === 0 && group_requests.length === 0 && (
          <p className="text-center my-4 fs-5 fw-bold">No notifications.</p>
        )
      }

    </div>
  )
}
