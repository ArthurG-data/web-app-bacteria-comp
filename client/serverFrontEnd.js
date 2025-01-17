const express=require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT=process.env.PORT || 3000;//change for 5000


const BACKEND_URL = 'http://localhost:5000'//'http://api.stochastom.cab432.com';

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.urlencoded({ extended: true }));
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL, // Replace with your Load Balancer DNS nam
    changeOrigin: true,
    /*pathRewrite: {
        '^/api': '', // Remove "/api" prefix when forwarding to the load balancer
    },*/
}));



//send the index.html file for each request except state static file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './build', 'index.html'));
});

async function startServer(){
    try{
    app.listen(PORT, ()=>{
        console.log(`Server is running on ${PORT}` )})
    }catch(err){
    console.error("Error during server startup:", err);
    process.exit(1);        
    }
}

startServer();
