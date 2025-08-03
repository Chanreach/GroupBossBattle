import { getGuestUser } from "./guestUtils";

export const getUserInfo = (user) => {
  if (user) {
    return {
      id: user.id,
      username: user.username,
      isGuest: user.isGuest ?? false,
    };
  }

  const guestUser = getGuestUser();
  if (guestUser) {
    return {
      id: guestUser.id,
      username: guestUser.username,
      isGuest: true,
    };
  }

  return null;
};
