export const formatUpdateTime = (dateString) => {
  if (!dateString) return "--";

  const date = new Date(dateString);
  const now = new Date();

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay(date, now)) {
    return `Hoy ${time}`;
  }

  if (isSameDay(date, yesterday)) {
    return `Ayer ${time}`;
  }

  return (
    date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }) + ` ${time}`
  );
};
