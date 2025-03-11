import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getCookie } from './Utils'
import { SendMsgIcon } from '../assets/icons/SendMsgIcon'
import { IMAGE_BASE_URL, WS_BASE_URL } from './Config'

export const ChatForMob = (props) => {

  const { user_id } = useParams();  // received from mobile version users
  const navigate = useNavigate();

  const [messages, setmessages] = useState([])
  const [username, setusername] = useState(null)

  // Retrieving all the chats from the server
  useEffect(() => {
    if (user_id) {

      var formData = new FormData()
      var data = user_id.split('-')
      formData.append('type', data[0])
      formData.append('id', data[1])
      formData.append('tk', getCookie('tk'))

      document.getElementById('loader').style.display = 'flex'

      axios({
        method: "POST",
        url: '/api/get-chats/',
        withCredentials: true,
        data: formData,
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        }
      })
        .then((resp) => {
          setmessages(resp.data.chats)
          setusername(resp.data.username)
          document.getElementById('loader').style.display = 'none'
        })
        .catch((error) => {
          toast.error('Something went wrong!')
          document.getElementById('loader').style.display = 'none'
        })
    }

  }, [user_id])


  // Connecting to the websocket
  const socketRef = useRef(null);

  useEffect(() => {

    if (user_id && username) {

      var selected_friend = user_id.split('-')

      const url = `${WS_BASE_URL}/ws/${selected_friend[0]}/${selected_friend[1]}/`
      socketRef.current = new WebSocket(url, ['token', getCookie('tk')])

      socketRef.current.onmessage = (event) => {
        var msg = JSON.parse(event.data)

        // Handle scenarios to close the chat page and redirect the user to the home page:
        // - "group_closed = true": Received when the user is removed from or exits the group.
        // - "group_deleted = true": Received when the group is deleted.
        // - "friend_connection_deleted = true": Received when the friend connection between two users ends (unfriend).
        if ((msg.group_closed && msg.username === username) || msg.group_deleted || msg.friend_connection_deleted) {
          if (socketRef.current && socketRef.current.readyState === 1) {
            socketRef.current.close();
          }
          navigate('/')
        }

        // Otherwise, display the received chat message.
        else {
          if (msg.username === username) {
            msg.type = 'send-msg'
          }
          else {
            msg.type = 'received-msg'
          }
          setmessages((prevMessages) => [...prevMessages, msg])
        }
      }

      socketRef.current.onerror = (event) => {
        toast.error("Something went wrong! Please refresh the page.")
      }
    }

    return () => {
      if (socketRef.current && socketRef.current.readyState === 1) {
        socketRef.current.close();
      }
    }

  }, [user_id, socketRef, username, navigate])



  // For adjusting height of the textarea(message input) while user typing the message
  const autoTextareaHeight = () => {
    const textarea = document.getElementById('chat-msg-input');
    textarea.style.height = '3rem'; // Reset height to auto to calculate actual height needed
    textarea.style.height = (textarea.scrollHeight) + 'px'; // Set height to match content
    if (textarea.scrollHeight > 130) {
      textarea.style.overflowY = 'auto'; // Enable vertical scrollbar
      textarea.style.height = '130px'; // Lock height to 130px
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }


  const sendMsg = (e) => {
    e.preventDefault();
    var form = document.getElementById("chat-msg-send-form")
    var formData = new FormData(form)

    var trim_msg = formData.get('message').trim();
    if (trim_msg.length > 0) {
      socketRef.current.send(JSON.stringify(trim_msg))
    }
    form.reset();

    autoTextareaHeight();  // On sending the message calling autoTextareaHeight to reset the height of the textarea 
  }

  // To scroll to bottom of the chat
  useEffect(() => {
    var scrollableDiv = document.getElementById('chat-messages-id');
    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
  }, [messages])



  return (
    <>

      {
        user_id ? (

          <div className="chat position-relative col pt-2 d-flex flex-column">

            <div className="chat-messages mt-2 px-3" id="chat-messages-id">

              {
                messages.length > 0 && (messages.map((msg) => {
                  return (
                    <div key={msg.id}>
                      {
                        // For Group Chats
                        // -> user_img available in group chat only
                        // -> If username !== msg.username, the message is from another user, so display it as a received message with their profile image beside it. Otherwise, it goes to the else statement, where the message is sent by the current user, and no image is displayed beside the message.
                        // "msg.type" will be "send-msg" or "received-msg"
                        msg.user_img && username !== msg.username ? (
                          // This will apply only to received messages in group chats.
                          <div key={msg.id} className="chat-msg-box d-flex my-3">
                            <div className="chat-user-img">
                              <Link to='/user-profile/' state={{ id: msg.user_id }}>
                                <img src={`${IMAGE_BASE_URL}${msg.user_img}`} alt="img" />
                              </Link>
                            </div>
                            <p className={`${msg.type} position-relative`}>
                              <span className="chat-msg ">{msg.message}</span>
                              <span className="chat-name">{msg.name.slice(0, 18)}</span>
                            </p>
                          </div>
                        ) :
                          (
                            // 1. For individual chats (friend-to-friend), no user profile image is displayed beside any chat messages since it's a one-on-one conversation.
                            // 2. This "else" statement is also activated for group chat when the current user sends a message, as sent messages don't need to show the profile image.
                            <div key={msg.id} className="chat-msg-box d-flex my-3">
                              <p className={msg.type}>
                                <span className="chat-msg user-chat-msg">{msg.message}</span>
                              </p>
                            </div>
                          )
                      }
                    </div>
                  )
                }))
              }

            </div>

            <form action="" className="chat-msg-form d-flex" id="chat-msg-send-form" onSubmit={sendMsg}>
              <textarea name="message" id="chat-msg-input" cols="" rows="" placeholder="Message" onInput={autoTextareaHeight}></textarea>
              <button type="submit" className="btn btn-primary d-flex justify-content-center align-items-center ms-2" title="Send">
                <SendMsgIcon />
              </button>
            </form>

          </div>

        ) : (

          <div className="chat position-relative col pt-2 d-flex flex-column align-items-center justify-content-center">
            <h2>Start Chatting!</h2>
          </div>
        )

      }


    </>
  )
}
