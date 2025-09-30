export const handleLogout = (setToken : any ,setuser : any  , setprofile: any, router : any ) => {
    // Clear token
    setToken(null);

    setuser(null);
    setprofile(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("profileData");
    localStorage.removeItem("signupData");
    localStorage.removeItem("pendingCreds");
    localStorage.removeItem("profileToastShown");

    sessionStorage.clear();

    router.push("/signin");
  };