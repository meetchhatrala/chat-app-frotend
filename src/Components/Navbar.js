import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2';
import { LeftArrowIcon } from '../assets/icons/LeftArrowIcon';
import { SearchIcon } from '../assets/icons/SearchIcon';
import { BellIcon } from '../assets/icons/BellIcon';


export const Navbar = (props) => {
    const navigate = useNavigate();
    const [no_of_notif, setno_of_notif] = useState(0)

    useEffect(() => {
        setno_of_notif(props.user_notifications.friend_requests.length + props.user_notifications.group_requests.length)
    }, [props.user_notifications])


    // Triggered on clicking search icon and back button(icon) (mobile version)
    const mobileSearch = (id) => {
        var mobileSearchInput = document.querySelector(".mobile-search-input")
        mobileSearchInput.classList.toggle("d-none")

        if (id === 'mobile-search-btn') {
            document.querySelector(".mobile-search-input > input").focus()
        }
    }

    // search form submission
    const searchFormSubmit = (e) => {
        e.preventDefault();
        var formId = document.getElementById(e.target.id)
        var formData = new FormData(formId)

        var query = formData.get('search')
        navigate(`/search/${query}/`)
    }

    // Hiding the offcanvas(side menu) after clicking the nav link (for mobile versions)
    const navLinkClicked = () => {
        document.getElementById('offcanvas-close').click()
    }

    const logoutHandler = () => {
        Swal.fire({
            title: 'Logout ?',
            text: 'You are going to logout!',
            icon: 'warning',
            confirmButtonText: 'Logout',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            showCloseButton: true,
        })
            .then((result) => {
                if (result.isConfirmed) {
                    document.cookie = `tk=empty; max-age=0; path=/; sameSite=None; secure=true;`;
                    props.setauthenticated(false)
                    navigate('/login/')
                }
            })
    }

    return (

        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid position-relative">

                <div className="nav-left">

                    <button className="navbar-toggler" data-bs-theme="dark" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <Link className="h4 text-decoration-none mx-2 glow-text fw-bold" to="/">ChatApp</Link>
                </div>

                {/* class nav-right is for mobile versions */}
                <div className="nav-right d-flex justify-content-center align-items-center mx-3">

                    <form className="d-flex" role="search" id="mobile-search-form" onSubmit={searchFormSubmit}>

                        <div className="mobile-search-input d-none">
                            <LeftArrowIcon width={33} height={33} onclick={mobileSearch} />
                            <input className="form-control me-2" name="search" type="search" placeholder="Search User" aria-label="Search" />
                        </div>

                        <div id="mobile-search-btn" className="d-flex align-items-center justify-content-center" onClick={() => mobileSearch('mobile-search-btn')}>
                            <SearchIcon color="#ffffff" />
                        </div>
                    </form>

                    <div className="notification-icon d-flex justify-content-center align-items-center mx-1">

                        <div className="position-absolute">
                            <Link to="/notifications/">
                                <BellIcon color="#ffffff" />
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger overflow-hidden">
                                    {
                                        no_of_notif > 0 && (
                                            no_of_notif
                                        )
                                    }
                                </span>
                            </Link>
                        </div>

                    </div>

                </div>



                {/* Sidebar for mobile versions */}
                <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" style={{ width: '260px' }}>
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title glow-text" id="offcanvasExampleLabel">ChatApp</h5>
                        <button type="button" className="btn-close btn-close-white" id="offcanvas-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>

                    <div className="offcanvas-body ms-2">

                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active fw-bold mx-2" aria-current="page" to="/" onClick={navLinkClicked}>Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active fw-bold mx-2" to="/account/" onClick={navLinkClicked}>Account</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active fw-bold mx-2" to="/create-group/" onClick={navLinkClicked}>Create Group</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active fw-bold mx-2" to="/contact/" onClick={navLinkClicked}>Contact</Link>
                            </li>
                            <li className="nav-item logout-btn">
                                <button className="btn btn-sm btn-danger ms-2 mt-3 fw-bold d-none" title="logout" onClick={logoutHandler}>Logout</button>
                            </li>
                        </ul>


                        <div className="offcanvas-right d-flex align-items-center">

                            <form className="d-flex position-relative" role="search" id="search-form" onSubmit={searchFormSubmit}>
                                <input className="form-control me-2" type="search" name="search" placeholder="Search User" aria-label="Search" />
                                <SearchIcon color="#000000" />
                            </form>

                            <div className="position-relative mx-2">
                                <Link to="/notifications/">
                                    <BellIcon width={25} height={25} color="#ffffff" />
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger overflow-hidden">
                                        {
                                            no_of_notif > 0 && (
                                                no_of_notif
                                            )
                                        }
                                    </span>
                                </Link>
                            </div>

                            <button className="btn btn-sm btn-danger ms-4 fw-bold" title="logout" onClick={logoutHandler}>Logout</button>

                        </div>


                    </div>
                </div>
            </div>
        </nav>

    )
}
