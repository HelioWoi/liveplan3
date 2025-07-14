export default function Skeleton({
  height = 24,
  width = "50%",
  className = "",
}) {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      style={{ height, width }}
    />
  );
}
