import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useParams } from 'react-router-dom'
import { getCookie } from './Utils'
import { ChatIcon2 } from '../assets/icons/ChatIcon2'
import { RequestSentIcon } from '../assets/icons/RequestSentIcon'
import { BellIcon } from '../assets/icons/BellIcon'
import { SendRequestIcon } from '../assets/icons/SendRequestIcon'
import { IMAGE_BASE_URL } from './Config'

export const Search = (props) => {

  const { query } = useParams();

  document.title = "Search - ChatApp"

  const [searchResult, setsearchResult] = useState({ 'users_list': [], 'groups_list': [] })

  // Fetch search results from the server.
  useEffect(() => {
    document.getElementById("loader").style.display = "flex"

    var formData = new FormData()
    formData.append('search', query)
    formData.append('tk', getCookie('tk'))

    axios({
      method: "POST",
      url: '/api/search/',
      withCredentials: true,
      data: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    })
      .then((resp) => {
        document.getElementById("loader").style.display = "none"
        setsearchResult(resp.data)
      })
      .catch((error) => {
        document.getElementById("loader").style.display = "none"
        toast.error("Something went wrong!")
      })
  }, [query])


  const sendFriendRequest = (id) => {
    document.getElementById("loader").style.display = "flex"
    var type_id = id.split('_')    // will be [user/group, id]

    var formData = new FormData()
    formData.append('type', type_id[0])
    formData.append('id', type_id[1])
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
          toast.success("Request sent.")

          // Sets 'request_send' in 'searchResult' to 'true' to display the request sent tick marks.
          if (type_id[0] === 'user') {
            var users_list = searchResult.users_list.map((user) => {
              if (user.id === parseInt(type_id[1])) {
                user['request_send'] = true
              }
              return user
            })
            setsearchResult({ 'users_list': users_list, 'groups_list': searchResult.groups_list })
          }
          else {
            var groups_list = searchResult.groups_list.map((group) => {
              if (group.id === parseInt(type_id[1])) {
                group['request_send'] = true
              }
              return group
            })
            setsearchResult({ 'users_list': searchResult.users_list, 'groups_list': groups_list })
          }
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
    <div className="search-usr-div">

      {
        searchResult.users_list.length > 0 && (
          <>
            <p className="search-usr-type fw-bold">People</p>

            {searchResult.users_list.map((user) => {
              return (
                <div className="search-usr d-flex justify-content-around align-items-center" key={`userkey${user.id}`}>
                  <div className="usr-img">
                    <Link to="/user-profile/" state={{ id: user.id }}>
                      <img src={`${IMAGE_BASE_URL}${user.image}`} alt="profile_pic" />
                    </Link>
                  </div>
                  <div className="usr-details">
                    <p className="mb-0 fw-bold">{user.name.slice(0, 25)}</p>
                    <p className="mb-0">{user.email.slice(0, 25)}</p>
                  </div>
                  <div className="usr-request">
                    {

                      user.request_accepted ? (
                        <Link to="/" state={{ chat_user: `user-${user.id}` }} >
                          <ChatIcon2 width={25} height={25} color="#0d6efd" />
                        </Link>

                      ) : user.request_send ? (
                        <RequestSentIcon width={25} height={25} color="#07bc0c" />

                      ) : user.request_received ? (
                        <Link to="/notifications/">
                          <BellIcon width={25} height={25} color="#dc3545" title="Received Request" />
                        </Link>

                      ) : (
                        <SendRequestIcon width={25} height={25} color="#6d2df1" onclick={() => sendFriendRequest(`user_${user.id}`)} />
                      )

                    }

                  </div>
                </div>
              )
            })}

          </>
        )
      }

      {
        searchResult.groups_list.length > 0 && (
          <>
            <p className="search-usr-type fw-bold">Groups</p>

            {searchResult.groups_list.map((group) => {
              return (
                <div className="search-usr d-flex justify-content-around align-items-center" key={`groupkey${group.id}`}>
                  <div className="usr-img">
                    <Link to='/group-profile/' state={{ id: group.id }}  >
                      <img src={`${IMAGE_BASE_URL}${group.image}`} alt="profile_pic" />
                    </Link>
                  </div>
                  <div className="usr-details">
                    <p className="mb-0 fw-bold">{group.name.slice(0, 25)}</p>
                  </div>
                  <div className="usr-request">
                    {
                      group.request_send ? (
                        group.request_accepted ?
                          <Link to="/" state={{ chat_user: `group-${group.id}` }} >
                            <ChatIcon2 width={25} height={25} color="#0d6efd" />
                          </Link>
                          :
                          <RequestSentIcon width={25} height={25} color="#07bc0c" />

                      ) : (
                        <SendRequestIcon width={25} height={25} color="#6d2df1" onclick={() => sendFriendRequest(`group_${group.id}`)} />
                      )
                    }

                  </div>
                </div>
              )
            })}

          </>
        )
      }


      {
        searchResult.users_list.length <= 0 && searchResult.groups_list.length <= 0 && (
          <h2 className="text-center my-4">Not found!</h2>
        )
      }

      {/* Describing the symbols */}
      <div className="m-auto d-flex flex-column align-items-center justify-content-center my-2">
        <div className="d-flex">
          <SendRequestIcon width={25} height={25} color="#6d2df1" />
          <p> - Send Friend Request</p>
        </div>
        <div className="d-flex">
          <RequestSentIcon width={25} height={25} color="#07bc0c" />
          <p> - Friend Request Sent</p>
        </div>
        <div className="d-flex">
          <ChatIcon2 width={25} height={25} color="#0d6efd" />
          <p>- Start Chatting Now</p>
        </div>

      </div>

    </div>
  )
}
