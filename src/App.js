import './Style.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './Components/Navbar';
import { Home } from './Components/Home';
import { Signup } from './Components/Signup';
import { Login } from './Components/Login';
import { Account } from './Components/Account';
import { Search } from './Components/Search';
import { Notifications } from './Components/Notifications';
import { Contact } from './Components/Contact'
import { CreateGroup } from './Components/CreateGroup';
import { UserProfile } from './Components/UserProfile';
import { GroupProfile } from './Components/GroupProfile';
import { Members } from './Components/Members';
import { ChatForMob } from './Components/ChatForMob';

import { useState, useEffect, useRef } from 'react';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCookie } from './Components/Utils';

import { WS_BASE_URL } from './Components/Config';

import axios from 'axios';

function App() {

  const [authenticated, setauthenticated] = useState(false)
  const [friends, setfriends] = useState({ friends_list: [], groups_list: [] })
  const [user_notifications, setuser_notifications] = useState({ friend_requests: [], group_requests: [] })

  axios.defaults.baseURL = "http://127.0.0.1:8000"    // axios base url setup

  // Makes a GET request to the server, which sets up the CSRF cookie in the browser's response, this cookie can then be used for subsequent POST requests to securely submit forms to the server.
  useEffect(() => {
    axios.get('/api/csrf/', { withCredentials: true })
  }, [])


  useEffect(() => {
    if (getCookie('tk')) {
      setauthenticated(true)

      // Fetching user connections (Friends, Groups)
      document.getElementById('loader').style.display = 'flex'
      var formData = new FormData()
      formData.append('tk', getCookie('tk'))
      axios({
        url: '/api/get-connections/',
        method: "POST",
        data: formData,
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        withCredentials: true,
      })
        .then((resp) => {
          setfriends(resp.data)
          document.getElementById('loader').style.display = 'none'
        })
        .catch((error) => {
          toast.error("Something went wrong! Please refresh the page.")
          document.getElementById('loader').style.display = 'none'
        })

    }
  }, [authenticated])


  // Fetch user notifications
  useEffect(() => {
    if (authenticated) {
      var formData = new FormData();
      formData.append('tk', getCookie('tk'))
      axios({
        method: 'POST',
        url: '/api/get-notifications/',
        data: formData,
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        }
      })
        .then((resp) => {
          setuser_notifications(resp.data)
        })
        .catch((error) => {
          toast.error('Something went wrong, try to refresh the page!')
        })
    }
  }, [authenticated])


  // Initializing websocket for live notifications and updates
  const socketRef = useRef(null);

  useEffect(() => {
    if (authenticated && socketRef.current === null) {
      socketRef.current = new WebSocket(`${WS_BASE_URL}/ws/notifications/`, ['token', getCookie('tk')])

      socketRef.current.onclose = () => {
        // Attempting to reconnect the WebSocket after an automatic connection closure.
        if (authenticated) {
          socketRef.current = new WebSocket(`${WS_BASE_URL}/ws/notifications/`, ['token', getCookie('tk')]);
        }
      }

      socketRef.current.onerror = (e) => {
        toast.error("Something went wrong! Please refresh the page.")
      }

      socketRef.current.onmessage = (event) => {
        var data = JSON.parse(event.data)

        // when user added to a group (or user group request has been accepted)
        if (data.added_to_group) {
          var group = {
            id: data.id,
            name: data.name,
            image: data.image,
          }
          toast.info(`You have been added to the ${group.name} group`)
          setfriends((prevFriends) => ({
            ...prevFriends,
            groups_list: [...prevFriends.groups_list, group]
          }))
        }

        // When user removed from group or group deleted
        else if (data.group_closed || data.group_deleted) {
          setfriends((prevFriends) => ({
            ...prevFriends,
            groups_list: prevFriends.groups_list.filter(group => group.id !== data.id)
          }))
          toast.info(data.msg)
        }

        // Notifies the group admin when a new group join request is received
        else if (data.received_group_request) {
          setuser_notifications((prevNotif) => ({
            ...prevNotif,
            group_requests: [...prevNotif.group_requests, data]
          }))
          toast.info("Received group joining request")
        }

        // When received friend request
        else if (data.received_friend_request) {
          setuser_notifications((prevNotif) => ({
            ...prevNotif,
            friend_requests: [...prevNotif.friend_requests, data]
          }))
          toast.info(data.msg)
        }

        // Notifies when the user's friend request is accepted by the other user
        else if (data.accepted_friend_request) {
          setfriends((prevFriends) => ({
            ...prevFriends,
            friends_list: [...prevFriends.friends_list, data]
          }))
          toast.info(data.msg)
        }

        // When friend connection between two user's ends(unfriend)
        else if (data.friend_connection_deleted) {
          setfriends((prevFriends) => ({
            ...prevFriends,
            friends_list: prevFriends.friends_list.filter(friend => friend.id !== data.id)
          }))
          toast.info(data.msg)
        }

        // Notifies when a user rejects the friend request sent by this user.
        else if (data.rejected_friend_request) {
          toast.info(data.msg)
        }

      }

    }
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    }

  }, [socketRef, authenticated])



  return (
    <>
      <ToastContainer position="top-center" theme="colored" autoClose={5000} />
      <BrowserRouter>
        {
          authenticated && <Navbar setauthenticated={setauthenticated} user_notifications={user_notifications} />
        }
        <Routes>

          <Route exact path="/" element={<Home authenticated={authenticated} friends={friends} />} />
          <Route exact path="/login/" element={<Login setauthenticated={setauthenticated} authenticated={authenticated} />} />
          <Route exact path="/signup/" element={<Signup setauthenticated={setauthenticated} authenticated={authenticated} />} />

          {
            authenticated && (
              <>

                <Route exact path="/chat/:user_id/" element={<ChatForMob />} />

                <Route exact path="/account/" element={<Account />} />
                <Route exact path="/search/:query/" element={<Search />} />
                <Route exact path="/notifications/" element={<Notifications user_notifications={user_notifications} setuser_notifications={setuser_notifications} setfriends={setfriends} />} />
                <Route exact path="/contact/" element={<Contact />} />
                <Route exact path="/create-group/" element={<CreateGroup setfriends={setfriends} />} />
                <Route exact path="/user-profile/" element={<UserProfile setfriends={setfriends} setuser_notifications={setuser_notifications} />} />
                <Route exact path="/group-profile/" element={<GroupProfile />} />

                <Route exact path="/members/:id/" element={<Members friends={friends} setuser_notifications={setuser_notifications} />} />

              </>

            )
          }

        </Routes>
      </BrowserRouter>

      {/* Loader activated when display set to flex, deactivated when display set to none */}
      <div id="loader" className="justify-content-around">
        <div className="loader-icon"></div>
        <p>Loading...</p>
      </div>

    </>

  );
}

export default App;
