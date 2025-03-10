<p align="center">
  <img src="client/src/assets/img/stochastome_logo.jfif" alt="Stochastome Logo" style="width: 100%; max-width: 800px; height: 800px;"/>
</p>

# Bacterial Protein Sequence Similarity Web App

Welcome to the **Bacterial Protein Sequence Similarity Web App**, a cloud-based platform enabling users to upload FASTA files with bacterial protein sequences and compute similarity scores based on 5-mer frequency counts. The application leverages a robust cloud infrastructure to deliver efficient processing, secure data handling, and scalable performance.

### Technologies Used
<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?logo=amazon-aws&logoColor=white" alt="AWS"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React"/>
</p>
---

## **Features**
- **User Authentication**: Registration and login are managed securely via Amazon Cognito.
- **File Upload**: Upload FASTA files containing bacterial protein sequences.
- **Similarity Score Computation**: Efficiently computes similarity scores based on the 5-mer frequency count method.
- **Data Storage**:
  - **Metadata Storage**: SQL database for tracking file metadata and computation details.
  - **Transaction Records**: MongoDB to ensure data accuracy and maintain a record of all computations and operations.
  - **File Storage**: Amazon S3 for secure storage of uploaded files and static assets.
- **HTTPS Secure Connection**: DNS configuration ensures secure access to the application.
- **Scalable Cloud Infrastructure**: Built for high performance and concurrent user access.

---

## **How It Works**
1. **User Registration**:
   - Users sign up or log in via Amazon Cognito, ensuring secure and scalable authentication.
2. **File Upload**:
   - Upload FASTA files via the web interface.
   - Files are stored securely in Amazon S3.
3. **Similarity Computation**:
   - Backend processes extract sequences from uploaded files.
   - A 5-mer frequency count is computed, and pairwise similarity scores are calculated.
   - Results and operational details are stored in the SQL database and MongoDB.
4. **Cloud Architecture**:
   - DNS ensures secure access with HTTPS.
   - Static pages are rendered from Amazon S3.
   - A load balancer distributes requests to EC2 instances for computation.
---

The Client View

![Screenshot 2025-01-18 103158](https://github.com/user-attachments/assets/03ef5ff8-d350-4b6e-9046-3b1a8261a919)

Walkthrough of Main Functionalities:

https://github.com/user-attachments/assets/03c76b14-d9c4-48d4-b5a9-fafe9fdff047

AWS Load Balancing Implementation:

https://github.com/user-attachments/assets/8de21630-fa87-4cda-ab43-6496a31c6f92

---

## **Cloud Architecture**
### Services Used
- **React**: Provides a responsive and user-friendly web interface. 
- **Amazon Cognito**: Manages user authentication and authorization.
- **Amazon S3**: Stores uploaded files and serves static assets.
- **SQL Database**: Tracks file metadata, computation progress, and results.
- **MongoDB**: Maintains transaction records to ensure data accuracy and operational transparency.
- **Amazon EC2**: Hosts the frontend and backend services.
- **Elastic Load Balancer (ELB)**: Distributes requests across EC2 instances for scalability.
- **DNS Configuration**: Ensures secure HTTPS access to the application.

### Workflow Overview
1. **Frontend**: 
   - Hosted on an EC2 instance.
   - Serves static pages from S3.
   - Provides an intuitive interface for user interaction.
2. **Backend**:
   - Distributed across multiple EC2 instances.
   - Handles file uploads, similarity computations, and database interactions.
3. **Data Flow**:
   - Uploaded files are stored in S3.
   - Metadata is recorded in the SQL database.
   - Transaction records are logged in MongoDB to verify operations and data consistency.

---

## **Technologies Used**
- **Frontend**:
  - HTML, CSS, and JavaScript for user interaction.
- **Backend**:
  - Node.js/Express.js for server logic.
  - JavaScript for sequence analysis and similarity computations.
- **Cloud Services**:
  - Amazon EC2, S3, Cognito, Elastic Load Balancer, and Route 53 for DNS.
- **Databases**:
  - SQL for metadata storage.
  - MongoDB for transaction records.

---

## **Setup Instructions**
### Prerequisites
- AWS account with access to EC2, S3, Cognito, and Route 53 services.
- Node.js and Python installed locally for development and testing.

### Deployment Steps
1. **Set Up Cognito**:
   - Create a Cognito user pool and configure client settings for your app.
2. **Deploy Frontend**:
   - Serve static assets via S3 or an EC2 instance.
   - Configure DNS for HTTPS access using Route 53.
3. **Configure Backend**:
   - Deploy backend code to multiple EC2 instances.
   - Connect to the SQL database and MongoDB for metadata and transaction records.
   - Configure the load balancer to distribute requests.
4. **Database Setup**:
   - Initialize SQL schema for metadata.
   - Set up MongoDB collections for transaction records.
5. **Access the App**:
   - Use the configured DNS URL to access the web app securely.

---

## **Usage**
1. **Register/Login**:
   - Create an account or log in via Cognito authentication.
2. **Upload Files**:
   - Drag and drop or select FASTA files for upload.
3. **Compute Scores**:
   - Click "Compute Similarity" to initiate processing.
4. **View Results**:
   - Access computation results through the interface or download them as files.

---

## **Future Enhancements**
- Add support for larger file uploads with chunking.
- Real-time progress updates via WebSockets or Server-Sent Events.
- Enhanced data visualizations for similarity scores.
- Integration with AWS Lambda for serverless processing.


---
