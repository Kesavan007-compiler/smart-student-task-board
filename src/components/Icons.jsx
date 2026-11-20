/**
 * Tiny inline SVG icons. No icon library needed.
 * Every icon accepts a `size` prop (default 18).
 */
const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export const IconGrid = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="7" height="7" rx="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.6" />
    <rect x="14" y="14" width="7" height="7" rx="1.6" />
  </svg>
)

export const IconList = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconCalendar = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
)

export const IconPlus = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconCheck = ({ size = 18 }) => (
  <svg {...base(size)} strokeWidth={2.4}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const IconEdit = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

export const IconTrash = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    <path d="M10 11v5M14 11v5" />
  </svg>
)

export const IconClock = ({ size = 14 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const IconSearch = ({ size = 17 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const IconLogout = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
)

export const IconMenu = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
)

export const IconX = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const IconChevronLeft = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

export const IconChevronRight = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export const IconBook = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2.5Z" />
    <path d="M4 17h15" />
  </svg>
)

export const IconFlame = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M12 22c4 0 6.5-2.6 6.5-6 0-4.5-4-6-4-10-2 1-3.5 2.5-3.5 5C10 9 9 8 9 6.5 6.5 8.5 5.5 11 5.5 16c0 3.4 2.5 6 6.5 6Z" />
  </svg>
)

export const IconAlert = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)

export const IconTarget = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
)

export const IconInbox = ({ size = 26 }) => (
  <svg {...base(size)}>
    <path d="M3 12h5l2 3h4l2-3h5" />
    <path d="M5.5 4.5h13L22 12v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5Z" />
  </svg>
)
