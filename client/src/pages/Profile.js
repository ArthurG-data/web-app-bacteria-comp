import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css'; 
import { useAuth } from '../components/AuthProvider'; 
import AdminProfile from "./AdminProfile";
import FileUpload from '../components/FileUpload'
import DisplayJobs from '../components/DisplayJobs';
import {jwtDecode} from 'jwt-decode';

const Profile = () => {
  const { token, user } = useAuth(); // Access the user from context
  const [files, setFiles] = useState([]); // Stores file names
  const [isFetching, setIsFetching] = useState(true); // Start with true to fetch files initially
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user file data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/files', {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        }
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching user files:', error);
    } finally {
      setIsFetching(false); // Reset the fetching state
    }
  };
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(!!decodedToken?.admin);
	console.log("user is:", isAdmin); // Set if the user is admin based on the token
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAdmin(false); // Handle case where token is invalid
      }

      // Fetch files if token is present and files are being fetched
      if (isFetching) {
        const fetchData = async () => {
          try {
            const response = await axios.get('/api/files', {
              headers: {
                Authorization: `Bearer ${token}`, // Pass token in the request
              },
            });
            setFiles(response.data); // Set the fetched files
            setIsFetching(false); // Stop fetching
          } catch (error) {
            console.error('Error fetching files:', error);
          }
        };

        fetchData();
      }
    }
  }, [token, isFetching]);
  // Handle file deletion
  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`/api/file/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        }
      });
      // Remove the deleted file from state
      setFiles(files.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Function to trigger refresh after a new file is uploaded
  const triggerRefresh = () => {
    setIsFetching(true); // This will trigger useEffect to re-fetch files
  };
  //function to handle checkbox
  const handleCheckboxChange= (fileId) => {
    setSelectedFiles((prevSelected)=>{
      if (prevSelected.includes(fileId)){
        return prevSelected.filter(id => id !== fileId);
      } else {
        return [...prevSelected, fileId];
      }
    });
  }
  const toggleView = () => {
    try{
      if(isAdmin){
        setIsAdminView((prevView) => !prevView);
        console.log("view:", isAdminView);
      }else{console.log("Admin check failed");}
    }catch(error){}
    
  };

  const handleSelectAll = () =>{
    if(selectAll){
      setSelectedFiles([]);
    } else {
      const allFileIds = files.map(file=>file.id);
      setSelectedFiles(allFileIds);
    }
    setSelectAll(!selectAll);
  }
  // Send selected files for comparison
  const handleCompare = async () => {
    try {
      if (selectedFiles.length < 2) {
        alert("Please select at least 2 files for comparison.");
        return;
      }
     

      const response = await axios.post('/api/compute-similarity',
        { fileIds: selectedFiles },
        {headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        }}
      );
      const {jobId} = response.data
      console.log('Start of computation, jobId is:', jobId);
      alert('Comparison started!');
    } catch (error) {
      console.error("Error comparing files", error);
      alert('Error occurred during comparison');
    }
  };
 
  return (
    <div>
      {isAdmin && (
        <button className="toggle-view-button" onClick={toggleView}>
          {isAdminView ? "Switch to User Profile" : "Switch to Admin Profile"}
        </button>
      )}
      {isAdminView ? (
        <AdminProfile/>
      ):(
      <div>
      <h1>Welcome, {user}!</h1> {/* Display username from context */}
      <button onClick={handleSelectAll}>
        {selectAll ? "Uncheck All" : "Select All"}
      </button>
      <button onClick={handleCompare}>Compare Selected Bacterias</button>
      <h2>Your uploaded files:</h2>
      <section className="display-table">
        <div className="profile-container">
          <table className="profile-table">
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>File</th>
                <th>Size kb</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan="3">No Uploaded Files</td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr className="row" key={file.id}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={()=>handleCheckboxChange(file.id)}
                        />
                    </td>
                    <td className="cell">{file.filename}</td>
                    <td>{file.size/1000}</td>
                    <td>
                      <button
                        className="delete"
                        onClick={() => handleDelete(file.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
       
      </section>
      {/* Pass triggerRefresh as a prop to FileUpload to refresh files after upload */}
      <FileUpload refreshFiles={triggerRefresh} />
      {console.log("Rendering DisplayJobs with user:", user, "and token:", token)}
      {token ? (
            <DisplayJobs token={token} />
          ) : (
            <p>Loading user data...</p>
          )}
      </div>
      )}
    </div>
  );
  };
 


export default Profile;
  
