KothaFinder Nepal is a responsive, production-ready web application designed
as a room and flat rental discovery platform for Nepal. It allows users to
browse verified rental listings across major Nepali cities including Kathmandu,
Lalitpur, Bhaktapur, Pokhara, and Chitwan.

The platform features a public-facing listing portal with search and filter
capabilities, and a full-featured admin dashboard for managing listings with
complete CRUD (Create, Read, Update, Delete) functionality, dynamic metrics
analytics, customer inquiry tracking, and session-persistent authentication.

Built entirely with vanilla HTML5, CSS3, and JavaScript — no frameworks,
no libraries, no dependencies.

FEATURES
Public Website:
• Hero section with background image and animated stats
• Location pin & house vector SVG branding

• Room/flat listing grid with responsive lazy-loaded cards
• Real-time search by title, description, city, or features
• City dropdown filter with instant results
• Interactive "Inquire Now" dynamic contact form linkage
• About benefits cards section with hover lift
• Contact form with robust client-side validations
• Smooth scroll navigation with frosted-glass sticky header
• Responsive design (desktop, tablet, mobile)
• Scroll-triggered reveal animations
• Toast notification alerts for user feedback

Admin Portal:
• Secure login modal with field-level validation
• Login button loading/spinner state
• Session persistence via localStorage (survives page refresh)
• Tabbed Dashboard Navigation:
- Manage Listings Tab (CRUD list + form panel)
- User Inquiries Tab (incoming customer messages table)
• Dynamic metrics calculations:
- Active Listings (live array count)
- Customer Inquiries (live inquiries array count)
- Primary Hotspots (Valley listings vs Major Cities breakdown)
• Add new listing form with image URL preview
• One-click Status Toggling (Available vs Rented badge toggle)
• Rented listings display a dimmed blurred overlay mask on public grid
• Separate Edit Listing modal

• Custom Delete Confirmation modal
• Admin search bar and city/sorting controls
• Logout clears session
• ESC key closes topmost modal
• Click outside modal closes it

Technical:
• Full CRUD operations with state and localStorage sync
• Single source of truth state management
• Event delegation on dynamic elements
• Debounced search inputs (200ms)
• XSS protection via HTML escaping
• Intersection Observer for scroll animations
• Keyboard focus trapping on modal overlays
• Body padding offset on modal opens to prevent page jitter
• Apple HIG 44px minimum touch-target heights compliance
• Hardware-accelerated 60fps motion design engine utilizing only transform & opacity
• Staggered page entry animations for Hero sections and listings room cards
• Delayed 300ms delete shrink-fade transitions and creation highlights for listings

FOLDER STRUCTURE
kotha finder/
├── index.html Main HTML structure (all sections + modals)
├── style.css Complete stylesheet (design system + responsive)
├── script.js Application logic (state, CRUD, auth, events)
└── README.txt Project documentation (this file)

HOW TO RUN
1. No build step or server required — simply open index.html in a browser.
2. Alternatively, serve with any local HTTP server:
- Python: python -m http.server 8000
- Node.js: npx serve .
- VS Code: Use "Live Server" extension
3. Navigate to http://localhost:8000 (or the port shown)
