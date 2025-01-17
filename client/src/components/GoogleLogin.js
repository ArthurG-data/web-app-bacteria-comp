import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

function Login2() {
  const responseMessage = (response) => {
    console.log(response);
};
const errorMessage = (error) => {
    console.log(error);
};
return (
    <div>
        <h2>React Google Login</h2>
        <br />
        <br />
        <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
    </div>
)
}

export default Login2;