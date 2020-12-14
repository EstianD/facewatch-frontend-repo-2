import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Material ui
import CssBaseline from "@material-ui/core/CssBaseline";
import { Container, Grid } from "@material-ui/core";

import AuthContext from "../hooks/AuthContext";

// Components
import Header from "./Header/Header";
// import Profiles from "./Profiles/Profiles";
import AddProfileModal from "../components/Profiles/AddProfileModal";
// import Main from "./Gallery/Main";
import UploadImage from "./Gallery/UploadImage";
import Folder from "./Gallery/Folder";
import GalleryImage from "../components/Gallery/GalleryImage";
import AddGallery from "./Gallery/AddGallery";
import Gallery from "./Gallery/Gallery";
import ImageModal from "./Gallery/ImageModal";
import FolderView from "./Gallery/FolderView";
import ProfileList from "./Profiles/ProfileList";
import UploadNotification from "./Header/UploadNotification";
import ErrorNotification from "./Header/ErrorNotification";
import Loader from "./Header/Loader";
import UploadLoader from "./Header/UploadLoader";

const Dashboard = ({ user, handleLogout }) => {
  const jwt = localStorage.getItem("jwt-auth");

  const { REACT_APP_NODE_URL } = process.env;
  const [profiles, setProfiles] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Upload notification
  const [uploadNotification, setUploadNotification] = useState(null);
  // Error notification
  const [errorNotification, setErrorNotification] = useState(null);

  // Folders
  const [view, setView] = useState("folder");
  // const [selectedFolder, setSelectedFolder] = useState({});
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Images
  const [selectedImg, setSelectedImg] = useState(null);

  // Uploading status
  const [imageUploading, setImageUploading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);

  console.log("DASHBOARD");
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
        console.log("PROFILES: ", res);
        setProfiles(res.data["profiles"]);
        setProfileLoading(false);
        // console.log(res);
      })
      .catch((error) => {
        console.log("ERROR: ", error);
        if (error.response.status == 400) {
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
        console.log("MATCHES: ", res);
        setGalleryData(res.data);
        setGalleryLoading(false);
      })
      .catch((error) => {
        console.log("ERROR: ", error);
        if (error.response.status == 400) {
          localStorage.removeItem("jwt-auth");
          handleLogout();
        }
      });
  };

  // Get profiles
  useEffect(() => {
    getProfileData();
  }, []);

  // Get gallery images
  useEffect(() => {
    getGalleryData();
  }, [profiles]);

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
        // console.log(res);
        const newProfilesArr = profiles.filter(
          (profile) => profile["id"] !== id
        );
        setProfiles(newProfilesArr);
        setUploadNotification("Profile successfully deleted!");
        setProfileLoading(false);
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
    console.log("DELETING IMAGE");
    console.log(image);
    console.log(jwt);
    console.log(galleryData);
    setGalleryLoading(true);
    // setProfileLoading(true);
    // console.log(jwt);
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
        console.log(res);
        getGalleryData();
        // setGalleryLoading(false);
        // setProfileLoading(false);
      });
  };

  // handleImageDelete();

  // Function for view change
  const handleFolderSelect = (id) => {
    // console.log(id);
    // console.log(galleryData[id]);
    setView("gallery");
    setSelectedFolderId(id);
    // setSelectedFolder(galleryData[id]);
  };

  const handleFolderView = () => {
    setView("folder");
    setSelectedFolderId(null);
  };

  return (
    <AuthContext.Provider value={user}>
      <CssBaseline />
      {/* <Container maxWidth="md"> */}
      <div className="dashboard-container">
        <Header handleLogout={handleLogout} />
        <div className="add-grid">
          <AddProfileModal
            setProfiles={setProfiles}
            profiles={profiles}
            getProfileData={getProfileData}
            profileLoading={profileLoading}
            setUploadNotification={setUploadNotification}
            setProfileUploading={setProfileUploading}
          />
          <UploadImage
            getGalleryData={getGalleryData}
            setUploadNotification={setUploadNotification}
            setImageUploading={setImageUploading}
          />
          {imageUploading && <UploadLoader componentLoading="gallery" />}
          {profileUploading && <UploadLoader componentLoading="profile" />}
          {uploadNotification && (
            <UploadNotification uploadNotification={uploadNotification} />
          )}
          {errorNotification && (
            <ErrorNotification errorNotification={errorNotification} />
          )}
        </div>
        {/* Profile head */}

        <div className="profile-title-grid">
          <div>
            <h3>Profiles</h3>
          </div>
          <div>{profileLoading && <Loader />}</div>
        </div>
        <ProfileList profiles={profiles} onProfileDelete={onProfileDelete} />
        {view == "gallery" && (
          <motion.img
            src="images/folder-grid/folder-grid.png"
            className="folder-grid-btn"
            onClick={() => handleFolderView()}
            whileHover={{ scale: 1.1 }}
          />
        )}
        {view == "folder" && (
          <FolderView
            galleryData={galleryData}
            handleFolderSelect={handleFolderSelect}
            galleryLoading={galleryLoading}
          />
        )}
        {view == "gallery" && (
          <Gallery
            galleryData={galleryData}
            // selectedFolder={selectedFolder}
            setSelectedImg={setSelectedImg}
            selectedFolderId={selectedFolderId}
            handleFolderView={handleFolderView}
            handleImageDelete={handleImageDelete}
            galleryLoading={galleryLoading}
          />
        )}
        {selectedImg && (
          <ImageModal
            selectedImg={selectedImg}
            setSelectedImg={setSelectedImg}
          />
        )}

        {/* {renderFolders()} */}
        {/* <AddGallery getGalleryData={getGalleryData} /> */}
        {/* { <Gallery galleryData={galleryData} />   */}
      </div>
      {/* </Container> */}
    </AuthContext.Provider>
  );
};

export default Dashboard;
