import PlaceholderAvatar from "./PlaceholderAvatar.jsx";

export default function AnimalPhoto({ url, alt, className = "w-10 h-10", iconClassName = "w-5 h-5" }) {
  if (!url) {
    return <PlaceholderAvatar className={className} iconClassName={iconClassName} />;
  }
  return (
    <img
      src={url}
      alt={alt || "Animal photo"}
      className={`${className} rounded-md object-cover border border-sand shrink-0`}
    />
  );
}
