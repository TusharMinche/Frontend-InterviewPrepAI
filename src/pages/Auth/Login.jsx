import React, {  useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from "../../components/Inputs/Input";
import { validateEmail } from '../../utils/helper.js';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS,BASE_URL } from '../../utils/apiPaths.js';
import { UserContext } from '../../context/userContext.jsx';





const Login = ({setCurrentPage}) => {
  const[email,setEmail] = useState("");
  const[password,setPassword] = useState("");
  const[error,setError] = useState(null);

  const  { updateUser } = useContext(UserContext);

  


  const navigate = useNavigate();

  //Handle Login form submit
  const handleLogin = async (e) =>{
    e.preventDefault();

    if(!validateEmail (email)) {
      setError("Please enter a valid email");
      return;
    }

    if(!password) {
      setError("Please enter the password");
      return;
    }

    setError("");
    
    //Login API call
   try{
      
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN , {
        email,
        password,
      });
      
      const {token} = response.data;
      console.log("Token Value:", token);
      if(token) {
        localStorage.setItem("token" ,token);
        updateUser(response.data)
        navigate("/dashboard");
      }
   } catch (error){
      
      if (error.response && error.response.data.message){
        setError(error.response.data.message);
      } else {
        setError("Something went wrong please try again");
      }
   }
  
  };
  return  (<div className='w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center'>
        <h3 className='text-lg font-semibold text-black'>Welcome Back</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Please enter your Details to login
        </p>


        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target}) => setEmail(target.value)}
            label="Email Adress"
            placeholder="tushar@example.com"
            type="text"
          />

             <Input
            value={password}
            onChange={({ target}) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 characters"
            type="password"
          />



        {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}


        <button type='submit' className='w-full bg-black text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-orange-200 hover:text-black transition duration-200'>
          LOGIN
        </button>
        <p className='text-[13px] text-slate-800 mt-3'>
          Don't have an account?{" "}
          <button
            className='font-medium text-primary underline cursor-pointer'
            onClick={() => {
              setCurrentPage("signup");
            }}
          >
            Sign Up
          </button>
        </p>
      </form>
      </div>
  
  );
};

export default Login ;
