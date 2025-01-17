
const express = require('express');
const path = require('path');
const router = express.Router();
const { authenticateCookie, authenticateToken } = require('../middlewares/auth.js');
const {signup ,signin, completeNewPassword, confirmMail}= require('../middlewares/userManagement.js');

//const CP = require("child_process");
const multer = require("multer");

const upload = multer({ dest: 'uploads/' });

router.post('/confirm', confirmMail)

router.post('/upload', upload.single('file'), uploadFiles)
//register a new user
router.post('/signup', signup);

router.post('/signin', signin);

router.post('/confirm-email',confirmMail)
//router.post('/complet-new-password', completeNewPassword);

function uploadFiles(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully' });
}


//router.use(express.static(path.join(__dirname, '../../client/build')));

// Serve the React app for all other routes
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

module.exports = router;
