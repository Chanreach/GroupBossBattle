export const getGuestId = () => {
  const guestUser = getGuestUser();
  return guestUser ? guestUser.id : null;
};

export const getGuestUser = () => {
  const guestUserData = localStorage.getItem("guestUser");
  if (
    !guestUserData ||
    guestUserData === "undefined" ||
    guestUserData === "null"
  ) {
    return null;
  }
  try {
    return JSON.parse(guestUserData);
  } catch (error) {
    console.error("Error parsing guest user data:", error);
    return null;
  }
};

export const getGuestToken = () => {
  const token = localStorage.getItem("guestToken");
  if (token === "undefined" || token === "null") {
    return null;
  }
  return token;
};

export const isGuestUser = () => {
  const guestUser = getGuestUser();
  return guestUser && guestUser.isGuest === true;
};

export const clearGuestData = () => {
  localStorage.removeItem("guestUser");
  localStorage.removeItem("guestToken");
};

export const getGuestDisplayName = () => {
  const guestUser = getGuestUser();
  return guestUser ? guestUser.username : "Guest User";
};
