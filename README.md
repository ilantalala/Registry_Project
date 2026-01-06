# Registry Project
# Video link: <https://www.loom.com/share/2c687a3fcbb0432ca7abdc67683c617e>
Authentication system with:
- **Web frontend (React)**
- **Mobile app (Expo / React Native)**
- **Backend (FastAPI)**

Supports **email/password authentication** and **Google OAuth**, using **JWT tokens** and **MongoDB**.

> Local development only.

---

## Project Structure

```
.
├── registry_web/        # React web frontend
├── registry_mobile/     # Expo / React Native mobile app
├── backend/             # FastAPI backend
└── README.md
```

---

## Tech Stack

### Web Frontend
- React
- React Router
- Google OAuth
- Lucide React

### Mobile App
- React Native
- Expo
- Expo Router
- Expo Auth Session (Google)
- AsyncStorage
- Lucide React Native

### Backend
- FastAPI
- MongoDB
- JWT
- Google OAuth 2.0
- Bcrypt

---

## Backend – FastAPI

### Features
- Email/password registration & login
- Google OAuth authentication
- JWT-based authentication
- Password hashing
- Protected routes

### Setup

#### Install Dependencies
```bash
pip install fastapi uvicorn motor bcrypt PyJWT google-auth httpx python-dotenv
```

#### Environment Variables (`backend/.env`)
```env
GOOGLE_CLIENT_ID=your-web-client-id
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
MONGO_DETAILS=mongodb://localhost:27017/registry_db
JWT_SECRET=your-secret-key
```

#### Run MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Start Backend
```bash
uvicorn main:app --reload
```

Backend runs at:
```
http://localhost:8000
```

### API Endpoints
- `POST /register`
- `POST /login`
- `POST /auth/google`
- `GET /me` (protected)
- `POST /logout` (protected)

---

## Web Frontend – React (`registry_web`)

### Features
- User registration & login
- Google OAuth sign-in
- JWT handling with `localStorage`
- Protected dashboard route

### Setup

#### Install Dependencies
```bash
npm install
```

Required packages:
```bash
npm install react-router-dom lucide-react @react-oauth/google
```

#### Environment Variables (`registry_web/.env`)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Google OAuth Provider
Wrap the app in `index.js`:
```js
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

#### Start Web App
```bash
npm start
```

Runs at:
```
http://localhost:3000
```

---

## Mobile App – Expo / React Native (`registry_mobile`)

### Features
- Email/password registration & login
- Google OAuth via Expo Auth Session
- JWT storage with AsyncStorage
- Automatic token attachment to API requests
- Auto logout on `401 Unauthorized`

### Main Screens
- **RegisterScreen**
  - Email/password sign-up
  - Google sign-in
  - Form validation
  - Success & error messages
- **LoginScreen**
  - Email/password login
  - Password visibility toggle
  - Loading and error states

### Token Handling
- Tokens and user data are stored using `AsyncStorage`
- Utility functions:
  - `saveToken`
  - `getToken`
  - `saveUser`
  - `clearAll`
- API helper automatically adds:
  ```
  Authorization: Bearer <token>
  ```

### Environment Variables (Expo)
Create or update `.env`:
```env
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your-expo-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

### API Configuration
The mobile app communicates with:
```
http://localhost:8000
```
(or a local network IP when running on a physical device)

### Install Dependencies
```bash
npm install
```

### Start Mobile App
```bash
npx expo start
```

- Scan QR code with Expo Go (physical device)
- Or run on Android emulator / iOS simulator

---

## Authentication Flow (Web & Mobile)

1. User registers or logs in
2. Backend returns a JWT token
3. Token stored locally:
   - Web: `localStorage`
   - Mobile: `AsyncStorage`
4. Requests include `Authorization: Bearer <token>`
5. Auto logout on `401 Unauthorized`

Stored data:
- `auth_token`
- `user_data`

---

## Common Issues

**MongoDB not running**
```bash
docker run -d -p 27017:27017 mongo
```

**Google OAuth not working**
- Verify Client IDs
- Restart dev servers after `.env` changes

**Mobile cannot reach backend**
- Use local network IP instead of `localhost`
- Ensure backend allows CORS for Expo

**CORS errors**
- Backend must allow:
  - `http://localhost:3000`
  - Expo development URLs

---

## Notes
- No production configuration
- No deployment setup
- Local development only
