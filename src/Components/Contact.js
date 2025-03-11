import React from 'react'
import { WebsiteIcon } from '../assets/icons/WebsiteIcon'
import { MailIcon } from '../assets/icons/MailIcon'
import { GitHubIcon } from '../assets/icons/GitHubIcon'
import { LinkedInIcon } from '../assets/icons/LinkedInIcon'

export const Contact = () => {

  document.title = "Contact - ChatApp"

  return (
    <div className="mx-auto d-flex flex-column align-items-center my-3">
      <h2 className="my-4 fw-bold">Contact Us</h2>
      <p className="fw-bold m-0">Get in touch with us!</p>
      <p className="text-center">Reach out to us through our social media platforms below.</p>

      <div className="d-flex my-2">

        <div className="mx-3">
          <a href="https://shivakumarv.vercel.app/" target="_blank" rel="noopener noreferrer" >
            <WebsiteIcon width={29} height={29} color="#3a3a3ad6" />
          </a>
        </div>

        <div className="mx-3">
          <a href="mailto:shivakumar.vsk1@gmail.com">
            <MailIcon width={29} height={29} color="#6d2df1" />
          </a>
        </div>

        <div className="mx-3">
          <a href="https://github.com/Shivakumar1V" target="_blank" rel="noopener noreferrer" >
            <GitHubIcon width={29} height={29} color="#000000" />
          </a>
        </div>

        <div className="mx-3">
          <a href="https://www.linkedin.com/in/shivakumar1v/" target="_blank" rel="noopener noreferrer" >
            <LinkedInIcon width={29} height={29} color="#0077B5" />
          </a>
        </div>

      </div>

    </div>
  )
}
