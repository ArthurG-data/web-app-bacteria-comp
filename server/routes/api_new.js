const express = require("express");
const router = express.Router();
const userManagement = require("../middlewares/userManagement.js");
const fileManager = require("../middlewares/filesManager.js");
const {authenticateToken} =require("../middlewares/auth.js");
const { computeStochastic, startComputation} =require("../middlewares/computedManager.js");
const s3_manager = require("../middlewares/s3_manager.js");
const {getJounalContent,  requestEmptyJounral,  requestJournalCheckup} = require("../middlewares/dynamoDB.js");
const multer = require('multer');



const upload = multer();

router.get('/health', (req, res) => {
    console.log('Health check endpoint was accessed');
    res.status(200).send('OK');
});
//GET and auth token
router.post("/signin", userManagement.signin);
//confirm an email
router.post("/confirm-mail", userManagement.confirmMail);
//API for the users
router.post('/signup', userManagement.signup);
//API for the files
router.get("/file/:fileId", authenticateToken, fileManager.readFiles)
router.post("/file", authenticateToken, upload.single('file'), fileManager.addFiles);
router.post("/presignedUrl",  authenticateToken, fileManager.presignedUrlRequest)
router.delete("/file/:fileId",authenticateToken,  fileManager.deletefile)
//GET the find all the file from a registerd user 
router.get("/files",authenticateToken, userManagement.showFiles);

//needs to add admin check
router.get("/users", userManagement.Accounts);
router.delete("/user/:userId", authenticateToken, userManagement.deleteUser)
//test to check the function works
router.post("/compute-stochastic/:fileId", authenticateToken,  computeStochastic);
//API to compare any number of bacteria, if no parameter compare all(should be post job)
router.post("/compute-similarity", authenticateToken, startComputation);
//get the jobs for a single user
router.get('/jobs', authenticateToken, userManagement.getJobs);
//delete Jobs
router.delete('/jobs', authenticateToken, userManagement.deleJobs);
//Get a presigned URL for download
router.get('/jobs/:jobId', authenticateToken, s3_manager.getUrlapi);

//app.post('/confirm-mfa', userManagement.confirmMfa);

//an endpoint to get the jobs in a journal
router.get('/journal/all', authenticateToken, getJounalContent);
//delete all entry in the jounral
router.delete('/journal/all', authenticateToken,  requestEmptyJounral);
//do a checkup of the transactions
router.get('/journal/checkup', authenticateToken, requestJournalCheckup )

module.exports = router;
