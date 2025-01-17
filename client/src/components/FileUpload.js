import React, { useState } from 'react';
import axios from 'axios';
import { useAuth} from './AuthProvider';


const FileUpload = ({refreshFiles}) => {
    const {token} = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
  
    const handleFileChange = (event) => {
      setFile(event.target.files[0]);
    };

    
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!file) {
        setError('Please select a file to upload.');
        return;
      }
  
      setUploading(true);
      setError(null);
      setSuccess(null);
      try {
        
        const response = await axios.post('/api/presignedUrl', {
		fileId: file.name,
		size: file.size},
         { headers : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          }
	}) ;
        console.log("response:", response)
        const url = await response.data.presignedUrl;
        console.log(url);

        const uploaded = await fetch(url, {
          method: "PUT",
          body:file,
          headers: {
            'Content-Type': file.type,
          }
        });

        if (!uploaded.ok){
          throw new Error(`Failed to upload filr:${uploaded.statusText}`);
        }

        setSuccess('File uploaded successfully!');
        setFile(null);
        event.target.reset();
        refreshFiles();
        
      } catch (error) {
        setError(error.message);
      } finally {
        setUploading(false);
      }
    };
  
    return (
        
      <div className="file-upload-container">
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    );
  };
  
  export default FileUpload;
  
