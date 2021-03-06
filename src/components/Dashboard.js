import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Material ui
import CssBaseline from "@material-ui/core/CssBaseline";

import AuthContext from "../hooks/AuthContext";

// Components
import Header from "./Header/Header";
import AddProfileModal from "../components/Profiles/AddProfileModal";
import UploadImage from "./Gallery/UploadImage";
import Gallery from "./Gallery/Gallery";
import ImageModal from "./Gallery/ImageModal";
import FolderView from "./Gallery/FolderView";
import ProfileList from "./Profiles/ProfileList";
import UploadNotification from "./Header/UploadNotification";
import ErrorNotification from "./Header/ErrorNotification";
import UploadLoader from "./Header/UploadLoader";
import DashboardStatus from "./Notifications/DashboardStatus";
import UploadSpinner from "./Header/UploadSpinner";

const Dashboard = ({ user, handleLogout }) => {
  const jwt = localStorage.getItem("jwt-auth");

  const { REACT_APP_NODE_URL } = process.env;
  const [profiles, setProfiles] = useState([]);
  const [profileStatus, setProfileStatus] = useState("");
  const [galleryStatus, setGalleryStatus] = useState("");
  const [galleryData, setGalleryData] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Upload notification
  const [uploadNotification, setUploadNotification] = useState(null);
  // Error notification
  const [errorNotification, setErrorNotification] = useState(null);

  // Folders
  const [view, setView] = useState("folder");
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Images
  const [selectedImg, setSelectedImg] = useState(null);

  // Uploading status
  const [imageUploading, setImageUploading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);

  // FUNCTIONS FOR PROFILE AND GALLERY HOOKS
  // Define function to retrieve data for profiles
  const getProfileData = () => {
    setProfileLoading(true);
    axios
      .get(`${REACT_APP_NODE_URL}/profiles/profiles`, {
        headers: {
          "Content-Type": `multipart/form-data`,
          "auth-token": jwt,
        },
      })
      .then((res) => {
        // Set profile state
        if (res.data.profiles.length === 0) {
          setProfileLoading(false);
          setProfileStatus("You have no profiles uploaded!");
        } else {
          setProfiles(res.data["profiles"]);
          setProfileLoading(false);
          setProfileStatus("");
        }
      })
      .catch((error) => {
        if (error.response.status === 400) {
          localStorage.removeItem("jwt-auth");
          handleLogout();
        }
      });
  };

  // Retrieve gallery
  const getGalleryData = () => {
    setGalleryLoading(true);
    // Update the document title using the browser API
    axios
      .get(`${REACT_APP_NODE_URL}/profiles/getProfileMatches`, {
        headers: {
          "Content-Type": `multipart/form-data`,
          "auth-token": jwt,
        },
      })
      .then((res) => {
        // Set state for the gallery
        if (res.data.length > 0) {
          setGalleryData(res.data);
          setGalleryLoading(false);
          setGalleryStatus("");
        } else {
          setGalleryData(res.data);
          setGalleryLoading(false);
          setGalleryStatus("You have not uploaded any images yet.");
          setView("folder");
        }
      })
      .catch((error) => {
        // Redirect to login form if authentication expired
        if (error.response.status === 400) {
          localStorage.removeItem("jwt-auth");
          handleLogout();
        }
      });
  };

  // Get all profiles for logged in user
  useEffect(() => {
    getProfileData();
  }, []);

  // Get gallery images for logged in user
  // Run everytime profile state changes
  useEffect(() => {
    getGalleryData();
  }, [profiles]);

  // Handle the deletion of a profile
  const onProfileDelete = (e) => {
    const id = e;
    setProfileLoading(true);

    axios
      .post(
        `${REACT_APP_NODE_URL}/profiles/deleteProfile`,
        {
          id: id,
        },
        {
          headers: {
            "Content-Type": `application/json`,
            "auth-token": jwt,
          },
        }
      )
      .then((res) => {
        // Filter out the deleted profile from the state
        const newProfilesArr = profiles.filter(
          (profile) => profile["id"] !== id
        );
        setProfiles(newProfilesArr);
        setUploadNotification("Profile successfully deleted!");
        setProfileLoading(false);
        // Check if profiles is empty
        if (newProfilesArr.length === 0) {
          setProfileStatus("You have no profiles uploaded!");
        }

        setTimeout(() => {
          setUploadNotification(null);
        }, 3000);
      })
      .catch((err) => {
        setErrorNotification("Something went wrong, please try again shortly!");
      });
  };

  // Handle image delete from gallery
  const handleImageDelete = async (image) => {
    setGalleryLoading(true);

    axios
      .post(
        `${REACT_APP_NODE_URL}/profiles/deleteImage`,
        {
          image,
        },
        {
          headers: {
            "Content-Type": `application/json`,
            "auth-token": jwt,
          },
        }
      )
      .then((res) => {
        // Retrieve new gallery
        getGalleryData();
      });
  };

  // Functions for view change
  // Set view to gallery when clicked on folder
  const handleFolderSelect = (id) => {
    setView("gallery");
    setSelectedFolderId(id);
  };
  // Set view to folder when clicked on tab icon above gallery
  const handleFolderView = () => {
    setView("folder");
    setSelectedFolderId(null);
  };

  return (
    // Wrap components with the authContext
    <AuthContext.Provider value={user}>
      <CssBaseline />
      <div className="dashboard-container">
        {/* Header section */}
        <Header handleLogout={handleLogout} />
        {/* Add content grid */}
        <div className="add-grid">
          <AddProfileModal
            setProfiles={setProfiles}
            profiles={profiles}
            getProfileData={getProfileData}
            profileLoading={profileLoading}
            setUploadNotification={setUploadNotification}
            setProfileUploading={setProfileUploading}
            setErrorNotification={setErrorNotification}
          />
          <UploadImage
            getGalleryData={getGalleryData}
            setUploadNotification={setUploadNotification}
            setImageUploading={setImageUploading}
            setErrorNotification={setErrorNotification}
          />

          {imageUploading && <UploadLoader componentLoading="gallery" />}
          {profileUploading && <UploadLoader componentLoading="profile" />}
          {uploadNotification && (
            <UploadNotification
              uploadNotification={uploadNotification}
              setUploadNotification={setUploadNotification}
            />
          )}
          {errorNotification && (
            <ErrorNotification
              errorNotification={errorNotification}
              setErrorNotification={setErrorNotification}
            />
          )}
        </div>
        {/* <UploadSpinner /> */}
        {/* Profile section */}
        <div className="profile-title-grid">
          <div>
            <h3>Profiles</h3>
          </div>
        </div>
        {/* Profiles section */}

        {profileStatus && <DashboardStatus notificationText={profileStatus} />}
        {profiles && (
          <ProfileList profiles={profiles} onProfileDelete={onProfileDelete} />
        )}

        {/* Main grid views */}
        {/* Gallery back button */}
        {view === "gallery" && (
          <motion.img
            src="images/folder-grid/folder-grid.png"
            className="folder-grid-btn"
            onClick={() => handleFolderView()}
            whileHover={{ scale: 1.1 }}
          />
        )}
        {/* Render Folders/Profiles */}

        {view === "folder" && (
          <FolderView
            galleryData={galleryData}
            handleFolderSelect={handleFolderSelect}
            galleryLoading={galleryLoading}
          />
        )}
        {galleryStatus && <DashboardStatus notificationText={galleryStatus} />}
        {/* Render gallery */}
        {view === "gallery" && (
          <Gallery
            galleryData={galleryData}
            setSelectedImg={setSelectedImg}
            selectedFolderId={selectedFolderId}
            handleFolderView={handleFolderView}
            handleImageDelete={handleImageDelete}
            galleryLoading={galleryLoading}
          />
        )}
        {/* IF image is selected, load image modal */}
        {selectedImg && (
          <ImageModal
            selectedImg={selectedImg}
            setSelectedImg={setSelectedImg}
          />
        )}
      </div>
    </AuthContext.Provider>
  );
};

export default Dashboard;
