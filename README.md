# Expo Chat App with Supabase Authentication

A modern chat application built with Expo React Native and Supabase, featuring user authentication and real-time messaging capabilities.

## Features

- 🔐 User Authentication (Sign up, Sign in, Sign out)
- 👤 User Profile Management
- 💬 Real-time Chat Interface
- 🌓 Dark Mode Support
- ⌨️ Multi-line Message Support (Shift+Enter)
- 📱 Responsive Design (Mobile & Web)
- 🔢 Character Count Limit with Visual Feedback

## Tech Stack

- [Expo](https://expo.dev/) - React Native development framework
- [Supabase](https://supabase.com/) - Backend and Authentication
- [React Native Elements](https://reactnativeelements.com/) - UI Components
- [Expo Router](https://docs.expo.dev/routing/introduction/) - Navigation
- [TypeScript](https://www.typescriptlang.org/) - Type Safety

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Supabase Account

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd expo-user-management
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Supabase project and get your credentials:
   - Go to [Supabase](https://supabase.com/)
   - Create a new project
   - Get your project URL and anon key

4. Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

```
expo-user-management/
├── app/                    # App screens and navigation
│   ├── (app)/             # Protected routes
│   │   ├── index.tsx      # Main screen
│   │   └── chat.tsx       # Chat interface
│   ├── _layout.tsx        # Root layout
│   ├── auth.tsx           # Authentication screen
│   └── index.tsx          # Entry point
├── components/            # Reusable components
│   ├── Account.tsx        # Account management
│   └── Auth.tsx          # Authentication forms
├── lib/                   # Utilities and configurations
│   └── supabase.ts       # Supabase client setup
└── assets/               # Images and fonts
```

## Features in Detail

### Authentication
- Email/Password authentication
- Protected routes
- Automatic session management

### Profile Management
- Update username and website
- View and edit profile information
- Session persistence

### Chat Interface
- Real-time messaging
- Message timestamps
- Character limit (120 characters)
- Visual feedback for remaining characters
- Support for multi-line messages
- Dark mode toggle

## Development

To start development:

1. Run in web mode:
   ```bash
   npx expo start --web
   ```

2. Run on iOS simulator:
   ```bash
   npx expo start --ios
   ```

3. Run on Android emulator:
   ```bash
   npx expo start --android
   ```

## Deployment

1. Build for web:
   ```bash
   npx expo export:web
   ```

2. Build for iOS/Android:
   ```bash
   eas build
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Elements](https://reactnativeelements.com/docs)
