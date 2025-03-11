import React, { useState, useEffect } from 'react'
import { FriendsList } from './FriendsList'
import { Chat } from './Chat'
import { Navigate, useNavigate, useLocation } from 'react-router-dom';

export const Home = (props) => {
  const [isMobileView, setisMobileView] = useState(window.innerWidth <= 991)
  const [selectedFriend, setselectedFriend] = useState(null)  // will be a string -> "user-id_here" (or) "group-id_here", example "user-20" (or) "group-20"

  const location = useLocation();
  const { chat_user } = location.state || {};  // will be triggered when user clicked on "Start Chat" button in "Search.js" or "UserProfile.js" and below useEffect will set the "selectedFriend" value to "chat_user"

  const navigate = useNavigate();

  document.title = 'Home - ChatApp'


  useEffect(() => {
    if (!props.authenticated) {
      navigate("/login/")
    }
  }, [props.authenticated, navigate])


  useEffect(() => {
    if (chat_user) {
      setselectedFriend(chat_user)
    }
  }, [chat_user])


  window.addEventListener('resize', () => {
    setisMobileView(window.innerWidth <= 991)
  })


  return (
    <>

      {/* 
    
    -- Wokflow --

    Desktop Versions:
    For Desktop (width of the screen > 991px) showing "FriendList" component on the left side and "Chat" component on right side.
    When user clicks(select) on a friend(or group) to chat, showing Chat on right side and can chat with that friend(or group).
    
    Mobile Versions:
    For Mobiles (width of the screen <= 991px)
    First showing the "FriendList" component only, when user click(select) on a friend to chat navigating user to "/chat/user_id/"(ChatForMob.js) with user ID, then it will open chat window
    
    */}


      <div className="home row">

        {
          isMobileView ? (

            selectedFriend ? (
              <Navigate to={`/chat/${selectedFriend}/`} />

            ) : (
              <FriendsList setselectedFriend={setselectedFriend} authenticated={props.authenticated} friends={props.friends} />
            )

          ) : (
            <>
              <FriendsList setselectedFriend={setselectedFriend} authenticated={props.authenticated} friends={props.friends} chat_user={chat_user} />
              <Chat selectedFriend={selectedFriend} setselectedFriend={setselectedFriend} />
            </>
          )
        }

      </div>
    </>
  )
}
