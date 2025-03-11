import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getCookie } from './Utils'
import { TrashIcon } from '../assets/icons/TrashIcon'
import { IMAGE_BASE_URL } from './Config'


export const Members = (props) => {
  const { id } = useParams();
  const [members, setmembers] = useState([])

  const [editMembersClicked, seteditMembersClicked] = useState(false)

  // These are friend connections of the admin who are not in the group as members
  const [nonMemberFriends, setnonMemberFriends] = useState([])

  document.title = "Members - ChatApp"


  // Fetch group members from the server
  useEffect(() => {
    axios.get(`/api/get-members/${id}/`, { withCredentials: true })
      .then((resp) => {
        setmembers(resp.data.members)
      })
  }, [id])


  // Setting "nonMemberFriends", nonMemberFriends are the friends who are not in the Group as members 
  useEffect(() => {
    var friends_list = props.friends.friends_list

    // Creating a set with all members id's in it
    var members_id = new Set(members.map(member => member.id));
    var non_members = []

    // Checking if the friend is not in the members then push the friend to non_members array
    friends_list.forEach(obj => {
      if (!members_id.has(obj.id)) {
        non_members.push(obj)
      }
    })
    setnonMemberFriends(non_members)

  }, [props.friends, members])


  // Making request to the server to remove the selected members from the group
  const removeMembers = (e) => {
    e.preventDefault();
    document.getElementById('loader').style.display = 'flex'

    const form = document.getElementById('remove-members-form')
    const formData = new FormData(form)
    var entries = [...formData.entries()]  // will be like this [['name(selected_user_id)', 'value'], ...]
    var remove_members_id = entries.map(obj => parseInt(obj[0]))  // Converting the string to an integer for comparison after the server response is true.

    const updatedFormData = new FormData();
    updatedFormData.append('members', JSON.stringify(remove_members_id))
    updatedFormData.append('tk', getCookie('tk'))

    if (remove_members_id.length > 0) {
      axios({
        method: "POST",
        url: `/api/remove-members/${id}/`,
        data: updatedFormData,
        withCredentials: true,
        headers: {
          "X-CSRFToken": getCookie('csrftoken')
        }
      })
        .then((resp) => {
          document.getElementById("loader").style.display = "none"

          if (resp.data.status) {
            var members_after_removal = members.filter(member => !remove_members_id.includes(member.id))
            setmembers(members_after_removal)  
            seteditMembersClicked(false)
            toast.success("Successfully removed the user(s) from the group.")
          }
        })
        .catch((error) => {
          document.getElementById("loader").style.display = "none"
          toast.error("Something went wrong!")
        })
    }
    else {
      toast.info("Select member's to remove!")
      document.getElementById("loader").style.display = "none"
    }
  }

  // Adding members from friends list to the group
  const addMembers = (e) => {
    e.preventDefault();
    document.getElementById('loader').style.display = 'flex'

    const form = document.getElementById('add-members-form')
    const formData = new FormData(form)
    var entries = [...formData.entries()]  // will like this [['name(selected_user_id)', 'value], ...]
    var added_members_id = entries.map(obj => parseInt(obj[0]))   // Converting the string to an integer for comparison after the server response is true.

    const updatedFormData = new FormData();

    updatedFormData.append('members', JSON.stringify(added_members_id))
    updatedFormData.append('tk', getCookie('tk'))

    if (added_members_id.length > 0){
      axios({
        method: "POST",
        url: `/api/add-members/${id}/`,
        data: updatedFormData,
        withCredentials: true,
        headers: {
          "X-CSRFToken": getCookie('csrftoken')
        }
      })
      .then((resp) => {
        document.getElementById("loader").style.display = "none"

        if (resp.data.status) {
          var added_members = nonMemberFriends.filter(obj => added_members_id.includes(obj.id))
          setmembers([...members, ...added_members])   

          // If a friend had already sent a group join request, remove it from "user_notifications" as the admin added them directly to the group from this page.
          props.setuser_notifications((prevNotif) => ({
            ...prevNotif,
            group_requests: prevNotif.group_requests.filter(req => {
              if (added_members_id.includes(req.user_id) && req.group_id === parseInt(id)){
                return false
              }
              return true
            })
          }))

          // Hiding the offcanvas
          document.getElementById('offcanvasBotton-close-btn').click();
          toast.success("Added members successfully.")
        }
      })
      .catch((error) => {
        document.getElementById("loader").style.display = "none"
        toast.error("Something went wrong!")
      })
    }
    else {
      toast.info("Select user's to add!")
      document.getElementById("loader").style.display = "none"
    }

  }

  return (

    <div className="members px-1" style={{ backgroundColor: 're' }}>
      {
        members.length > 0 ? (
          <>
            {
              editMembersClicked ? (
                <p className="search-usr-type fw-bold">Select members to remove</p>
              ) : (
                <p className="search-usr-type fw-bold">Group Members</p>
              )
            }

            <form onSubmit={removeMembers} id="remove-members-form">

              {
                members.map((req) => {
                  return (
                    <label htmlFor={`member_input_${req.id}`} className="notification d-flex align-items-center position-relative" key={`friend_req_${req.id}`}>
                      <Link to='/user-profile/' state={{ id: req.id }} className="mx-3" >
                        <img src={`${IMAGE_BASE_URL}${req.image}`} alt="profile" className="ms-2" />
                      </Link>
                      <div className="notification-user-details ms-2 me-4">
                        <p className="notification-user-name fw-bold">{req.name.slice(0, 18)}</p>
                        <p>{req.email.slice(0, 16)}</p>
                      </div>

                      {
                        editMembersClicked && (
                          <input type="checkbox" name={req.id} id={`member_input_${req.id}`} />
                        )
                      }
                    </label>
                  )
                })
              }

              <div className="d-flex justify-content-between px-4 my-3">
                {
                  editMembersClicked ? (
                    <>
                      <button className="btn btn-sm btn-outline-dark" onClick={() => seteditMembersClicked(false)} type="button" >Cancel</button>
                      <button className="btn btn-sm btn-danger" type="submit">Remove</button>
                    </>
                  ) : (
                    <>
                      <TrashIcon width={24} height={24} color="#dc3545" onclick={() => seteditMembersClicked(true)} />

                      {/* will trigger offcanvas below */}
                      <button className="btn btn-primary btn-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom">Add Members</button>
                    </>

                  )
                }

              </div>
            </form>
          </>
        ) : (
          <div className="mt-2 d-flex flex-column align-items-center">
            <p className="text-center fw-bold my-3">This group has no members yet.</p>

            {/* will trigger offcanvas below */}
            <button className="btn btn-primary btn-sm my-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom">Add Members</button>
          </div>
        )
      }



      {/* offcanvas triggered when clicked on "Add Members" button */}
      <div className="offcanvas offcanvas-bottom" tabIndex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel" style={{ height: '85vh', width: '23rem', margin: 'auto', backgroundColor: 'white' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasBottomLabel">Add members from friends</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" id="offcanvasBotton-close-btn"></button>
        </div>
        <div className="offcanvas-body small">
          <form id="add-members-form" onSubmit={addMembers}>
            {
              nonMemberFriends.length > 0 ? (
                <>
                  {
                    nonMemberFriends.map((req) => {
                      return (
                        <label htmlFor={`addmember_input_${req.id}`} className="notification d-flex align-items-center position-relative" key={`add_member_${req.id}`}>
                          <Link to='/user-profile/' state={{ id: req.id }} className="mx-3" >
                            <img src={`${IMAGE_BASE_URL}${req.image}`} alt="profile" className="ms-2" />
                          </Link>
                          <div className="notification-user-details ms-2 me-4">
                            <p className="notification-user-name fw-bold">{req.name.slice(0, 18)}</p>
                            <p>{req.email.slice(0, 16)}</p>
                          </div>
                          <input type="checkbox" name={req.id} id={`addmember_input_${req.id}`} />
                        </label>
                      )
                    })
                  }

                  <div className="d-flex justify-content-center mt-4 mb-3">
                    <button type="submit" className="btn btn-primary btn-sm">Add Members</button>
                  </div>
                </>
              ) : (
                <p className="text-center">No friend connections available/already in the group.</p>
              )
            }
          </form>
        </div>
      </div>

    </div>

  )
}
