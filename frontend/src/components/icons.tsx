// Set de iconos propios, línea fina, coherente con la identidad de sello oficial.
// Sin emojis: trazo monocromo (currentColor), controlado por className.

interface IconProps {
  className?: string;
}

export function PawIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse cx="12" cy="16.2" rx="5.2" ry="4.3" fill="currentColor" />
      <ellipse cx="5.3" cy="10.2" rx="2.1" ry="2.6" fill="currentColor" transform="rotate(-18 5.3 10.2)" />
      <ellipse cx="9.6" cy="6.3" rx="2" ry="2.7" fill="currentColor" transform="rotate(-8 9.6 6.3)" />
      <ellipse cx="14.4" cy="6.3" rx="2" ry="2.7" fill="currentColor" transform="rotate(8 14.4 6.3)" />
      <ellipse cx="18.7" cy="10.2" rx="2.1" ry="2.6" fill="currentColor" transform="rotate(18 18.7 10.2)" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.7" r="2.3" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M6.6 3.5h3l1.4 4.5-2.1 1.7a12.5 12.5 0 0 0 5.4 5.4l1.7-2.1 4.5 1.4v3a1.6 1.6 0 0 1-1.7 1.6C11.6 18.6 5.4 12.4 5 5.2A1.6 1.6 0 0 1 6.6 3.5Z" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M12 3.3 5 5.9v5.4c0 4.7 2.9 8.2 7 9.4 4.1-1.2 7-4.7 7-9.4V5.9L12 3.3Z" />
      <path d="M9 12.1 11.2 14 15.4 9.6" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M4 8h3l1.4-2h7.2L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.2" r="3.4" />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function SearchOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.35-4.35" />
    </svg>
  );
}
