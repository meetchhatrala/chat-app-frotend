import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getCookie } from './Utils';
import { UnfriendIcon } from '../assets/icons/UnfriendIcon';
import { ChatIcon1 } from '../assets/icons/ChatIcon1';
import { RejectIcon } from '../assets/icons/RejectIcon';
import { AcceptIcon } from '../assets/icons/AcceptIcon';
import { IMAGE_BASE_URL } from './Config';

export const UserProfile = (props) => {
  const location = useLocation();
  const { id } = location.state || {};
  const [profile, setprofile] = useState({ first_name: 'firstname', last_name: 'lastname', email: 'email' })
  // For "profile" server sends -> {first_name: 'firstname', last_name: 'lastname', email: 'email', image: 'image_url', is_friend: 'true/false', request_sent: 'true/false', received_request: 'true/false'}

  document.title = `${profile.first_name} - ChatApp`


  useEffect(() => {
    if (id) {
      document.getElementById('loader').style.display = 'flex'

      axios.get(`/api/get-user-details/${id}/`, { withCredentials: true })
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


  // Handles accepting/rejecting friend requests and unfriending users.  
  // Called within the "handleRequest" function.
  const requestToServer = (data) => {
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
          if (data.get('type') === 'accept') {
            toast.success("Friend request accepted")
            setprofile({ ...profile, is_friend: true })
            var user_details = {
              id: id,
              name: profile.first_name,
              email: profile.email,
              image: profile.image
            }
            // adding the user to friends list
            props.setfriends((prevFriends) => ({
              ...prevFriends,
              friends_list: [...prevFriends.friends_list, user_details]
            }))
            // removing the user friend request from notifications
            props.setuser_notifications((prevNotif) => ({
              ...prevNotif,
              friend_requests: prevNotif.friend_requests.filter(friend => friend.id !== id)
            }))
          }
          else if (data.get('type') === 'reject') {
            setprofile({ ...profile, is_friend: false, request_sent: false, received_request: false })
            toast.success("Friend request rejected")
            // removing the user friend request from notifications
            props.setuser_notifications((prevNotif) => ({
              ...prevNotif,
              friend_requests: prevNotif.friend_requests.filter(friend => friend.id !== id)
            }))
          }
          // if unfriended the user
          else {
            setprofile({ ...profile, is_friend: false, request_sent: false, received_request: false })
          }
        }
      })
      .catch((error) => {
        document.getElementById('loader').style.display = 'none'
        toast.error("Something went wrong!")
      })
  }

  // For accepting/rejecting friend request and for Unfriend user
  const handleRequest = (type) => {
    const formData = new FormData();
    formData.append('type', type)
    formData.append('id', id)
    formData.append('tk', getCookie('tk'))

    if (type === 'accept') {
      requestToServer(formData)
    }
    else if (type === 'reject') {
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
            requestToServer(formData)
          }
        })
    }
    // If request is for Unfriend
    else {
      Swal.fire({
        title: 'UnFriend User!',
        text: 'Removes friend connection with the user.',
        icon: 'warning',
        confirmButtonText: 'Unfriend',
        confirmButtonColor: '#d33',
        showCancelButton: true,
        showCloseButton: true,
      })
        .then((result) => {
          if (result.isConfirmed) {
            requestToServer(formData)
          }
        })
    }
  }

  const sendFriendRequest = () => {
    document.getElementById("loader").style.display = "flex"
    var formData = new FormData()
    formData.append('type', 'user')
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
          toast.success("Friend request sent")
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
        <label htmlFor="firstname" className="form-label">Firstname</label>
        <input type="text" className="form-control" name="first_name" id="first_name" disabled value={profile.first_name} />
      </div>
      <div className="mb-3">
        <label htmlFor="lastname" className="form-label">Lastname</label>
        <input type="text" className="form-control" name="last_name" id="last_name" disabled value={profile.last_name} />
      </div>
      <div className="mb-3">
        <label htmlFor="Email" className="form-label">Email</label>
        <input type="text" className="form-control" disabled name="email" id="Email" value={profile.email} />
      </div>


      {
        profile.is_friend ? (

          <div className="px-3 d-flex justify-content-between my-4" style={{ width: '89%' }}>
            <UnfriendIcon width={29} height={29} onclick={() => handleRequest('unfriend')} color="#dc3545" />
            <Link to="/" state={{ chat_user: `user-${id}` }} >
              <ChatIcon1 width={33} height={33} color="#198754" />
            </Link>
          </div>

        ) : profile.received_request ? (

          <div className="notification d-flex align-items-center justify-content-evenly my-4">
            <p className="mx-2 fw-bold" >Received Friend Request</p>
            <RejectIcon width={29} height={29} color="#dc3545" onclick={() => handleRequest('reject')} />
            <AcceptIcon width={29} height={29} color="#00b901" onclick={() => handleRequest('accept')} />
          </div>

        ) : profile.request_sent ? (
          <p className="fw-bold my-3" style={{ color: '#00b901' }} >Your friend request has been sent.</p>

        ) : (
          <button className="btn btn-primary btn-sm my-4" onClick={sendFriendRequest}>Send Friend Request</button>
        )
      }

    </div>
  )
}
