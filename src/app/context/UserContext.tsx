"use client";

import React, { createContext, useContext, useState, ReactNode, JSX, useEffect } from "react";

interface UserCreds {
  name: string;
  email: string;
  password: string;
  companyName ?: string,
  gstNumber?  : string
}

interface UserInterface {
  name: string;
  email: string;
}

interface LoginInterface {
  email: string;
  password: string;
}

interface UserContextType {
  userCreds: UserCreds;
  setUserCreds: React.Dispatch<React.SetStateAction<UserCreds>>;
  user: UserInterface | null;
  setuser: React.Dispatch<React.SetStateAction<UserInterface | null>>;
  loginCreds: LoginInterface;
  setLoginCreds: React.Dispatch<React.SetStateAction<LoginInterface>>;
  mode: string;
  setmode: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [userCreds, setUserCreds] = useState<UserCreds>({
    name: "",
    email: "",
    password: "",
  });

  const [loginCreds, setLoginCreds] = useState<LoginInterface>({
    email: "",
    password: "",
  });

  const [user, setuser] = useState<UserInterface | null>(null);
  const [mode, setmode] = useState("");

  // load from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setuser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  // sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

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
        setmode,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
