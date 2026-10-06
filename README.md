# NextWiki 2.0

## Modern Wikipedia-like Knowledge Explorer

NextWiki 2.0 is a completely redesigned, professional-grade knowledge exploration application that provides encyclopedia-style definitions, images, and interactive features for any topic you search.

## Features

### Core Functionality
- **AI-Powered Definitions**: Get comprehensive, encyclopedia-style definitions for any topic
- **Image Generation**: Automatic image retrieval for visual context
- **Multi-Language Support**: Available in 10+ languages (English, Italian, French, Spanish, German, Russian, Arabic, Chinese, Portuguese, Hindi)
- **Interactive Content**: Click on any word in definitions to learn more
- **Search History**: Keep track of your recent searches

### New in 2.0
- **Complete Design Overhaul**: Modern, professional UI with CSS variables and design system
- **Enhanced Responsive Design**: Perfect experience on mobile, tablet, and desktop
- **Improved Accessibility**: WCAG 2.1 AA compliant with keyboard navigation, screen reader support, and focus management
- **Performance Optimizations**: Faster loading, better caching, and optimized bundle size
- **Theme System**: Light and dark mode with customizable accent colors
- **Better Error Handling**: Graceful error states and user-friendly messages
- **Animation System**: Smooth, professional animations that respect user preferences (reduced motion)

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Modern CSS with CSS Variables, Flexbox, Grid
- **AI Integration**: OpenRouter API for AI-generated content
- **Images**: Pexels API for high-quality images
- **Authentication**: Firebase Auth with Google Sign-In
- **State Management**: React hooks with localStorage persistence

## Design System

### Colors
- Primary color palette with semantic naming
- Multiple accent color options (blue, green, yellow, pink, orange, red, purple)
- Light and dark theme support
- Automatic theme detection based on system preferences

### Typography
- System font stack for optimal performance
- Responsive font sizes
- Proper line heights and spacing

### Components
- Reusable, accessible UI components
- Consistent styling with CSS variables
- Responsive behavior
- Focus states and keyboard navigation

## Installation

```bash
# Clone the repository
git clone https://github.com/lollo21x/nextwiki.git
cd nextwiki

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
GEMINI_API_KEY=your_openrouter_api_key
```

## Project Structure

```
nextwiki/
├── index.tsx              # Entry point
├── App.tsx               # Main application component
├── index.css             # Main stylesheet (imports all CSS modules)
├── vite.config.ts        # Vite configuration
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
│
├── components/           # React components
│   ├── AuthModal.tsx     # Authentication modal
│   ├── ContentDisplay.tsx # Content display with interactive words
│   ├── HistoryDisplay.tsx # Search history component
│   ├── ImageDisplay.tsx   # Image display with loading states
│   ├── LoadingSkeleton.tsx # Loading skeleton component
│   ├── LogoutModal.tsx   # Logout confirmation modal
│   ├── SearchBar.tsx     # Search input component
│   ├── SettingsModal.tsx # Settings modal
│   └── ShareMenu.tsx     # Social sharing menu
│
├── services/            # API services
│   └── geminiService.ts  # AI content generation service
│
├── src/
│   ├── hooks/
│   │   └── useAuth.ts    # Authentication hook
│   └── services/
│       └── firebase.ts   # Firebase configuration
│
├── styles/              # CSS modules
│   ├── app.css          # Application-specific styles
│   ├── components.css   # Component library styles
│   ├── global.css       # Global reset and base styles
│   └── variables.css    # CSS variables and design tokens
│
└── utils/
    └── translations.ts   # Multi-language translations
```

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome for Android)

## Accessibility

NextWiki 2.0 is designed with accessibility in mind:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA attributes and semantic HTML
- **Focus Management**: Visible focus states for all interactive elements
- **Color Contrast**: Meets WCAG 2.1 AA contrast requirements
- **Reduced Motion**: Respects user preferences for reduced motion
- **Skip Links**: Allows keyboard users to skip to main content

## Performance

- **Lazy Loading**: Images are lazy-loaded for better performance
- **Code Splitting**: Vite's built-in code splitting
- **Bundle Optimization**: Minified and compressed assets
- **Efficient State Management**: Minimal re-renders with React hooks

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Credits

- **AI Content**: Powered by OpenRouter and Mistral AI
- **Images**: Provided by Pexels API
- **Authentication**: Firebase Authentication
- **Icons**: Lucide React

## Version History

- **2.0.0** (Current): Complete redesign with modern UI, improved accessibility, better responsive design
- **1.x**: Original version

---

**Made with ❤️ by [lollo21](http://lollo.dpdns.org)**
