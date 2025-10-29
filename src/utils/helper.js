export const formatNumericDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

export const formatTextualDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export const formatNumericDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatTextualDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const convertLocalDateTimeToUTC = (localDateTime) => {
  if (!localDateTime) return null;

  const [datePart, timePart] = localDateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const utcDate = new Date(year, month - 1, day, hours, minutes, 0);
  return utcDate.toISOString();
};

export const formatUTCDateTimeForLocalInput = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m ` : ""}${secs
    .toString()
    .padStart(2, "0")}s`;
};
