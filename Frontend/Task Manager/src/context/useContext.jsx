import { createContext, useState, useEffect } from "react";
import axiosinstance from "../utils/Axiosinstance";
import { API_PATHS } from "../utils/ApiPath";

export const UserContext = createContext();

const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(user) return;

        const accessToken = localStorage.getItem("Token");
        if(!accessToken){
            setLoading(false);
            return;
        }

    
    const fetchUser = async () => {
        try {
            const response = await axiosinstance.get(API_PATHS.AUTH.GET_PROFILE);
            setUser(response.data);
        }catch(error){
            console.log("user not authorized",error);
            clearUser();
        }finally{
            setLoading(false);
        }
    }
    fetchUser();
    }, []);

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("Token", userData.token);
        setLoading(false);
    }

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem("Token");
        setLoading(false);
    }
    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default ContextProvider;