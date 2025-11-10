import axios from "axios";
const API_URL = "http://localhost:5001/users";

// SIGNUP
export const registerTalent = async (email:string, password:string, name: string) => {

  const existingUser = await axios.get(`${API_URL}?email=${email}`);
  if (existingUser.data.length > 0) {
    throw new Error("User already exists");
  }

  
  const response = await axios.post(API_URL, { email, password, name });
  return response.data;
};


// LOGIN
export const loginUser = async (email:string, password:string) => {
    const response = await axios.get(`${API_URL}?email=${email}&password=${password}`);
    if (response.data.length === 0) {
      throw new Error("Invalid email or password");
    }
    return response.data[0];
  };

  
  
