import React, {useEffect, useState } from 'react';
import axios from 'axios';


function DisplayJobs({ token }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobIds, setSelectedJobIds] = useState([]);

  const handleCheckboxChange = (jobId) => {
    setSelectedJobIds((prevSelected) => {
      if (prevSelected.includes(jobId)) {
        // If the job ID is already selected, remove it
        return prevSelected.filter(id => id !== jobId);
      } else {
        // If it's not selected, add it
        return [...prevSelected, jobId];
      }
    });
  };

  // Fetch jobs from the API
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`/api/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
      setLoading(false);
    }
  };

  // Handle delete action for selected jobs
  const handleDelete = async (event) => {
    event.preventDefault();
    if (selectedJobIds.length === 0) {
      alert('Please select at least one job to delete.');
      return;
    }
    
    try {
      await axios.delete('/api/jobs', {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
        data: { jobIds: selectedJobIds } // Send job IDs in the request body
      });
      console.log('Jobs deleted');

      // Fetch the updated list of jobs after deletion
      fetchJobs(); // Call fetchJobs to refresh the job list
      setSelectedJobIds([]); // Clear selected IDs after deletion
    } catch (error) {
      console.error('Error deleting jobs:', error);
      setError('Failed to delete jobs');
    }
  };

  const handleDownload = async (jobId) => {
    try {
      const response = await axios.get(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const downloadUrl = response.data.url;

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `job_${jobId}_result.txt`); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error fetching download URL:', error);
      alert('Failed to download the file.');
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs(); // Fetch jobs when the component mounts or when the token changes
    } else {
      console.log('Missing token, cannot fetch jobs.');
      setLoading(false); // Set loading to false if no token is present
    }
  }, [token]); // Include token in dependencies if it may change

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>{error}</div>;


  return (
    <div>
    <h2>Job History</h2>
    <button onClick={handleDelete} className="profile">
      Delete Selected Jobs
    </button>
    <section className="display-table">
      <div className="profile-container">
        <table className="profile-table">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Job ID</th>
              <th>Progress (%)</th>
              <th>Completion Date</th>
              <th>Duration (s)</th>
              <th>Result File</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="6">No jobs available</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.Id}>
                  <td>
                    <input 
                      type="checkbox"
                      checked={selectedJobIds.includes(job.id)}
                      onChange={() => handleCheckboxChange(job.id)} 
                    />
                  </td>
                  <td>{job.id}</td>
                  <td>{job.progress}</td>
                  <td>{job.completionDate ? new Date(job.completionDate).toLocaleString() : 'N/A'}</td>
                  <td>{job.duration}</td>
                  <td>
                      <button
                        className="download"
                        onClick={() => handleDownload(job.id)}
                      >
                        Download
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
}

export default DisplayJobs;

