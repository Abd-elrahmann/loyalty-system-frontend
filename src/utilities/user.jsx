const profile = localStorage.getItem("profile");

export const user = profile
  ? JSON.parse(profile)
  : {
      role: "USER",
    };
