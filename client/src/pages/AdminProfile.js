import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminProfile.css';
import { useAuth } from '../components/AuthProvider'; 
import {jwtDecode} from "jwt-decode";

const AdminProfile =() => {
    const { token, user } = useAuth(); // Access the user from context
    const [users, setUsers] = useState([]);
    const [isFetching, setIsFetching] = useState(true); // Start with true to fetch files initially
    const [isAdmin, setIsAdmin] = useState(false)
  //for extra security, check the user is admin before rendering the page
  useEffect(() => {
    // Decode the token and check if the user is an admin
    if (token) {
      try{
      const decoded = jwtDecode(token);
      setIsAdmin(decoded.admin);
      console.log("amin in authAdmin:", decoded, token);
      } catch (err){
        console.log("Error while loading the token in the admin page:", err);
        setIsAdmin(false);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          }
        });
        setUsers(response.data.result);
        console.log("Fetched users:", response.data.result);
      } catch (error) {
        console.error('Error fetching users data', error);
      } finally {
        setIsFetching(false); // Reset the fetching state
      }
    };

    if (token && isAdmin) {
      fetchData();
    }
  }, [token, isAdmin]);   // Fetch data when token or isAdmin changes

     
      const handleDelete = async (userId) => {
        try {
          await axios.delete(`/api/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in Authorization header
            }
          });
          // Remove the deleted file from state
          setUsers(users.filter((user) => user.id !== userId));
          setIsFetching(true);

        } catch (error) {
          console.error('Error deleting user', error);
        }
      };

      const triggerRefresh = () => {
        setIsFetching(true); // This will trigger useEffect to re-fetch files
      };
      return (
        <div>
          <h1>Welcome, {user}, you are on your admin profile!</h1> 
          <h2>Registered Users:</h2>
          <section className="display-table">
            <div className="admin-container">
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="3">No Registered User</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr className="row" key={user.id}>
                        
                        <td className="cell">{user.account_name}</td>
                        <td className="cell">{user.id}</td>
                        <td>
                          <button
                            className="delete"
                            onClick={() => handleDelete(user.id)}
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
        </div>
      );
    };
    
    export default AdminProfile;
