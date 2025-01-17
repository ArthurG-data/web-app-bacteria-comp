const express=require('express');
const cookieParser = require('cookie-parser');
const path = require("path");
const {fetchLoginSecret} = require('./middlewares/secretManager')
const PORT=process.env.PORT || 5000;

const {journalCheckup} = require('./middlewares/dynamoDB')

const app=express();
app.set('trust proxy', true);
let secret;

//Middleware to log each incoming request

(async () => {
    try {
        secret = await fetchLoginSecret();
        console.log("Secret successfully initialized.");
    } catch (error) {
        console.error("Failed to initialize secret:", error);
        process.exit(1); // Exit if secret cannot be initialized
    }
})();

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Specify your frontend origin
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true, // If cookies are needed
}));
// Middleware to use the secret
app.use((req, res, next) => {
    req.secret = secret;
    next();
});

app.use(express.json());
app.use(cookieParser());

//app.use(express.static(path.join(__dirname, '../client/build'))); don't need it with load balancer
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log(`Full URL: ${fullUrl}`);
    console.log(`Received ${req.method} request for ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length) {
        console.log('Body:', req.body);
    }
    console.log('----------------------------');
    next();
});

//const webclientRoute = require("./routes/webclient.js"); 
const apiRoute = require("./routes/api_new.js");

app.use("/api", apiRoute);
//app.use("/", webclientRoute);
//default route
app.get('*', (req, res) => {
    res.status(200).send('Page is reachable');
});
async function startServer(){
    try{
    await journalCheckup();

    app.listen(PORT, ()=>{
        console.log(`Server is running on ${PORT}` )})
    }catch(err){
    console.error("Error during server startup:", err);
    process.exit(1);        
    }
}

// Run the startServer function
startServer();
