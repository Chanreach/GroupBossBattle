export const getGuestId = () => {
  const guestUser = getGuestUser();
  return guestUser ? guestUser.id : null;
};

export const getGuestUser = () => {
  const guestUserData = localStorage.getItem("guestUser");
  return guestUserData ? JSON.parse(guestUserData) : null;
};

export const getGuestToken = () => {
  return localStorage.getItem("guestToken");
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
