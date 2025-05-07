import React from 'react';
import Logo1 from "./Images/Ftrack_logo1.png";
import Nav from './Navbar';

function Header({userdata}) {
  return (
    <div className='mainheader'>
      <div className='d-flex justify-content-around '>
        <div id='logo'>
          <img src={Logo1}
            alt="FreshTrack Logo" />
        </div>
        <div id="welcome-container">
          <h4 id="wel-txt">Welcome to FreshTrack!</h4>
        </div>
      </div>
      <Nav userdata = {userdata}/>
    </div>
  );
};

export default Header;