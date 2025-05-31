# 🏥 Hospital Alert App

A critical real-time alert system for hospitals built with Expo (React Native), designed to notify medical staff of emergencies across Android, iOS, and Web platforms.

## 🚨 Project Overview

The Hospital Alert App is an MVP solution for streamlining emergency communications in hospital environments. When critical situations arise (like cardiac arrests), operators can instantly alert relevant medical staff through push notifications, with built-in escalation logic to ensure no emergency goes unattended.

### Key Features
- **Real-time Emergency Alerts**: Instant push notifications to medical staff
- **Role-based Access Control**: Different permissions for Operators, Doctors, Nurses, and Head Doctors
- **Smart Escalation Logic**: Automatic escalation if alerts aren't acknowledged within time limits
- **Cross-platform Support**: Works on Android, iOS, and Web
- **Acknowledgement System**: Track who has responded to alerts
- **Comprehensive Logging**: Full audit trail of all alerts and responses

## 👥 User Roles & Permissions

| Role | Can Create Alert | Can View Alerts | Can Acknowledge | Can View Logs |
|------|-----------------|-----------------|-----------------|---------------|
| Operator | ✅ | ✅ | ❌ | ✅ |
| Doctor | ❌ | ✅ | ✅ | ✅ |
| Registered Nurse | ❌ | ✅ | ✅ | ✅ |
| Head of Doctor | ❌ | ✅ | ✅ | ✅ |

## 🚨 Escalation System

### Escalation Tiers
| Tier | Role | Response Time Limit | Escalates To |
|------|------|-------------------|--------------|
| 1 | Nurse | 2 minutes | Doctor |
| 2 | Doctor | 3 minutes | Head of Doctor |
| 3 | Head of Doctor | 2 minutes | Re-alert All |

### Alert Flow
1. **Operator creates alert** → Sent to Tier 1 (Nurses)
2. **Timer starts** (2 minutes for nurses)
3. **If acknowledged** → Escalation stops
4. **If NOT acknowledged** → Escalates to next tier
5. **Process continues** until acknowledged or all tiers exhausted

## 🛠️ Tech Stack

- **Frontend Framework**: React Native with Expo SDK 53
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Backend**: Expo Router API routes with Better Auth (current) / tRPC (planned alternative)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with role-based access
- **State Management**: TanStack Query + Zustand/Context
- **Push Notifications**: Expo Push Notifications
- **Type Safety**: Full TypeScript support

## 📁 Project Structure

```
my-expo/
├── app/                    # Main application screens and routing
│   ├── (home)/            # Tab navigation group
│   │   ├── index.tsx      # Home screen with auth form
│   │   └── explore.tsx    # Explore tab screen
│   ├── api/               # API routes
│   │   └── auth/          # Better Auth API endpoints
│   └── _layout.tsx        # Root layout with theme provider
├── components/            # Reusable UI components
│   ├── shadcn/ui/        # shadcn/ui components
│   └── ui/               # Custom UI components
├── lib/                  # Core utilities and configurations
│   ├── auth.ts          # Better Auth server configuration
│   └── auth-client.ts   # Better Auth client with Expo integration
├── src/                  # Backend source code
│   └── db/              # Database configuration
│       ├── index.ts     # Database connection
│       └── schema.ts    # Drizzle schema definitions
└── assets/              # Static assets (images, fonts)
```

## 🗃️ Database Schema

### Core Tables
- **users**: id, name, email, role (Doctor|Nurse|HeadDoctor|Operator)
- **alerts**: id, room_no, alert_name, code_color, created_by, created_at, escalation_level, acknowledged_by
- **acknowledgements**: id, alert_id, user_id, acknowledged_at
- **escalation_logs**: id, alert_id, from_role, to_role, escalated_at
- **logs**: id, user_id, action, created_at

## 🛠️ Setup & Installation

### Prerequisites

- Bun (recommended) or Node.js 18+
- PostgreSQL database (or Neon account)
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-expo
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
BETTER_AUTH_SECRET=your-secret-key-change-in-production
BETTER_AUTH_BASE_URL=http://localhost:8081/api/auth
LOCAL_IP=your-local-ip-address  # For mobile device testing
```

4. Push database schema:
```bash
bun run db:push
```

5. Start the development server:
```bash
bun start
```

## 📱 Running on Devices

### iOS Simulator
```bash
bun run ios
```

### Android Emulator
```bash
bun run android
```

### Web Browser
```bash
bun run web
```

### Physical Device
1. Install Expo Go app on your device
2. Scan the QR code from the terminal
3. Ensure your device is on the same network as your development machine

## 🔧 Available Scripts

- `bun start` - Start the Expo development server
- `bun run android` - Run on Android emulator/device
- `bun run ios` - Run on iOS simulator/device
- `bun run web` - Run in web browser
- `bun run lint` - Run ESLint
- `bun run db:push` - Push database schema changes
- `bun run db:studio` - Open Drizzle Studio for database management
- `bun run reset-project` - Reset project to initial state

## 🔐 Authentication Features

- **Role-based authentication** (Doctor, Nurse, Head Doctor, Operator)
- **Email/password login** with OAuth Google login planned
- **Session management** with secure cookies
- **Mobile-optimized auth flow** with Expo Secure Store
- **Configurable trusted origins** for CORS
- **Rate limiting** and security features

## 🔔 Alert System Features

### Operator Alert Form
- Room Number (text input)
- Alert Name (e.g., "Cardiac Arrest")
- Alert Code/Color (select from predefined options)
- Timestamp (auto-generated)

### Alert Notifications
- Push notifications to relevant staff
- In-app real-time alerts
- Visual indicators for urgency levels
- Timer showing time until escalation

## ✅ MVP Milestones

1. **Phase 1** (80% Complete): Authentication System with role-based access
   - ✅ Better Auth setup with PostgreSQL
   - ✅ Database schema and migrations
   - ✅ Authentication UI (login/signup/forgot-password)
   - ✅ tRPC server setup and client integration
   - 🔄 AuthProvider context configuration (current issue)
2. **Phase 2** (Pending): Alert creation form for operators
3. **Phase 3** (Pending): Push notification integration
4. **Phase 4** (Pending): Acknowledgement system implementation
5. **Phase 5** (Pending): Escalation logic and timers
6. **Phase 6** (Pending): Comprehensive logging and audit trails

## 🚀 Deployment

### Web Deployment
The app can be deployed as a web application to any hosting service that supports Bun/Node.js.

### Mobile Deployment
1. Configure `app.json` with hospital branding
2. Build for production:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```
3. Submit to app stores using EAS Submit

## 🔒 Security Considerations

- HIPAA compliance considerations for patient data
- Secure authentication with role-based access control
- Encrypted data transmission
- Audit logging for all critical actions
- Session timeout for inactive users

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/alert-enhancement`)
3. Commit your changes (`git commit -m 'Add new alert feature'`)
4. Push to the branch (`git push origin feature/alert-enhancement`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or contributions, please open an issue in the GitHub repository.