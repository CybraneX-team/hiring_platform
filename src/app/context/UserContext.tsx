"use client";

import React, { createContext, useContext, useState, ReactNode, JSX, useEffect } from "react";

interface UserCreds {
  id?: string;
  name: string;
  email: string;
  password: string;
  companyName?: string;
  gstNumber?: string;
  signedUpAs?: string;
}

interface UserInterface {
  id: string;
  name: string;
  email: string;
  signedUpAs: string;
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
  profile: any;
  setprofile: any;
  updateProfile: (newProfile: any) => void;
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
    id: ""
  });

  const [loginCreds, setLoginCreds] = useState<LoginInterface>({
    email: "",
    password: "",
  });

  const [user, setuser] = useState<UserInterface | null>(null);
  const [profile, setprofile] = useState<any>(null);
  const [mode, setmode] = useState("");

  // FIXED: Update profile and localStorage in one place
  const updateProfile = (newProfile: any) => {
    
    // Update state
    setprofile(newProfile);
    
    // Update localStorage
    if (typeof window !== "undefined") {
      try {
        if (newProfile) {
          localStorage.setItem("profile", JSON.stringify(newProfile));
        } else {
          localStorage.removeItem("profile");
        }
      } catch (error) {
        console.error("Failed to update localStorage:", error);
      }
    }
  };

  // Load initial data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setuser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }

    try {
      const storedProfile = localStorage.getItem("profile");
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setprofile(parsedProfile);
        console.log("Profile loaded from localStorage:", parsedProfile);
      }
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
    }
  }, []);

  // Sync user state with localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to sync user to localStorage", error);
    }
  }, [user]);

  // REMOVED: The profile sync useEffect that was causing duplication
  // Profile updates should ONLY happen through updateProfile()

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
        profile,
        setprofile,
        updateProfile
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
