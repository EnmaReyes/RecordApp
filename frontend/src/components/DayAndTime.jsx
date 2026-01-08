export const formatUpdateTime = (dateValue) => {
  if (!dateValue) return "--";

  const date = new Date(dateValue);
  const now = new Date();

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
    .toLowerCase();

  if (isSameDay(date, now)) return `Hoy ${time}`;
  if (isSameDay(date, yesterday)) return `Ayer ${time}`;

  return (
    date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }) + ` ${time}`
  );
};
