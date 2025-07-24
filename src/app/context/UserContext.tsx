"use client";

import React, { createContext, useContext, useState, ReactNode, JSX } from 'react';


interface UserCreds {
  name : string;
  email: string;
  password: string;
}

interface userInterface {
  name : string;
  email: string;
}

interface loginInterface{
  email : string; 
  password  : string; 
}
interface UserContextType {
  userCreds: UserCreds;
  setUserCreds: React.Dispatch<React.SetStateAction<UserCreds>>;
  user: userInterface;
  setuser: React.Dispatch<React.SetStateAction<userInterface>>;
  loginCreds : loginInterface,
  setLoginCreds : React.Dispatch<React.SetStateAction<loginInterface>>;
  mode : string;
  setmode : React.Dispatch<React.SetStateAction<string>>
}

let UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [userCreds, setUserCreds] = useState<UserCreds>({
    name: '',
    email: '',
    password: '',
  });

  const [loginCreds , setLoginCreds] = useState({
    email  : "",
    password  : ""
  })

  const [user,setuser] = useState<userInterface>({
    name : "",
    email : ""
  })

  const [ mode , setmode ] = useState("")

  return (
    <UserContext.Provider 
    value={{ 
      userCreds, 
      setUserCreds, 
      user,
      setuser,
      loginCreds, 
      setLoginCreds,
      mode,
      setmode 
    }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
