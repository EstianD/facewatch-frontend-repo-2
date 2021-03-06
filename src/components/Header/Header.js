import React, { useContext } from "react";
import AuthContext from "../../hooks/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

// Import Components
import Logout from "./logout";

const Header = ({ handleLogout }) => {
  const user = useContext(AuthContext);

  return (
    <div className="top-nav">
      <div className="user-title">
        <h3>
          {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
        </h3>
      </div>
      <div className="app-logo">
        <FontAwesomeIcon icon={faUsers} size="2x" />
      </div>
      <div className="logout-div">
        <Logout handleLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Header;
