export default function PlaceholderAvatar({ className = "w-10 h-10", iconClassName = "w-5 h-5" }) {
  return (
    <div
      className={`${className} rounded-md bg-sandlight border border-sand flex items-center justify-center text-brass shrink-0`}
    >
      {/* simple cattle silhouette */}
      <svg viewBox="0 0 64 64" className={iconClassName} fill="currentColor">
        <path d="M20 14c-2.5 0-4.5 2-4.5 4.5 0 1.6.8 3 2 3.8-1.9 1.3-3.5 3.5-3.5 6.7 0 2 .6 3.6 1.6 4.9-2.9 1.7-4.6 4.9-4.6 9.1 0 6.6 4.9 11.5 11 12.7V57a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1.3c6.1-1.2 11-6.1 11-12.7 0-4.2-1.7-7.4-4.6-9.1 1-1.3 1.6-2.9 1.6-4.9 0-3.2-1.6-5.4-3.5-6.7 1.2-.8 2-2.2 2-3.8 0-2.5-2-4.5-4.5-4.5-1.6 0-3 .8-3.8 2-1.4-1.1-3.2-1.8-5.2-1.8-1.1 0-2.1.2-3 .6-.9-.4-1.9-.6-3-.6-2 0-3.8.7-5.2 1.8-.8-1.2-2.2-2-3.8-2z" />
      </svg>
    </div>
  );
}
