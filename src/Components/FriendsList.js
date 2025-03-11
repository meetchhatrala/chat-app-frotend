import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from './Config';

export const FriendsList = (props) => {

  let authenticated = props.authenticated

  // selectFriend works for both user/group
  const selectFriend = (user) => {
    props.setselectedFriend(user)

    // Highlights the selected friend by adding a background color and removes the background color from the previously selected friend
    const clickedUser = document.querySelector('.bg-blue')
    if (clickedUser) {
      clickedUser.classList.remove('bg-blue')
    }
    document.getElementById(user).classList.add('bg-blue')
  }

  // This useEffect triggers only when the user clicks the "Start Chat" button in "UserProfile.js" or "GroupProfile.js"
  useEffect(() => {
    // Highlights the selected friend by adding a background color and removes the background color from the previously selected friend
    if (props.chat_user && authenticated) {
      const clickedUser = document.querySelector('.bg-blue')
      if (clickedUser) {
        clickedUser.classList.remove('bg-blue')
      }
      document.getElementById(props.chat_user).classList.add('bg-blue')
    }
  }, [props.chat_user, authenticated])



  return (
    <>
      {authenticated && (

        <div className="friends-list col-3">
          {
            props.friends.friends_list.length > 0 && (
              <div className="users-list">
                <p className="search-usr-type fw-bold">Friends</p>
                {props.friends.friends_list.map((user) => {
                  return (
                    <div className="user-details d-flex align-items-center my-2 px-1 py-2" onClick={() => selectFriend(`user-${user.id}`)} key={`friend_${user.id}`} id={`user-${user.id}`}>
                      <Link to='/user-profile/' state={{ id: user.id }}  >
                        <img src={`${IMAGE_BASE_URL}${user.image}`} alt="profile" className="ms-4" />
                      </Link>

                      <div className="user ms-3">
                        <p className="user-name mb-0 fw-bold">{user.name.slice(0, 24)}</p>
                        <p className="fst-italic mb-0">{user.email.slice(0, 24)}</p>
                      </div>
                    </div>
                  )
                })
                }
              </div>
            )
          }

          {
            props.friends.groups_list.length > 0 && (
              <div className="groups-list">

                <p className="search-usr-type fw-bold">Groups</p>
                {props.friends.groups_list.map((group) => {
                  return (
                    <div className="user-details d-flex align-items-center my-2 px-1 py-2" onClick={() => selectFriend(`group-${group.id}`)} key={`group_${group.id}`} id={`group-${group.id}`}>
                      <Link to='/group-profile/' state={{ id: group.id }}  >
                        <img src={`${IMAGE_BASE_URL}${group.image}`} alt="profile" className="ms-4" />
                      </Link>
                      <div className="user ms-3">
                        <p className="user-name mb-0 fw-bold">{group.name.slice(0, 24)}</p>
                      </div>
                    </div>
                  )
                })
                }
              </div>
            )
          }


          {
            props.friends.friends_list.length === 0 && props.friends.groups_list.length === 0 && (
              <>
                <p className="text-center mt-5 mb-2">Add friend/group to start chatting.</p>
              </>
            )
          }

        </div>
      )}
    </>
  )
}
