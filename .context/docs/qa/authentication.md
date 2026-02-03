# Authentication in FiscalZen

Authentication is a core feature in the FiscalZen platform, responsible for securely identifying users and managing access to protected resources and functionalities. This page explains the overall authentication flow, key interfaces, state management strategies, and provides practical guidance for developers extending or integrating with authentication features in the FiscalZen app.

---

## Overview

FiscalZen implements authentication primarily on the frontend using application state and typed interfaces, and on the backend via secure API endpoints that validate credentials and issue tokens. Both sides of the stack work together to ensure secure access and robust session handling.

---

## Key Interfaces and State

### `Usuario` Interface

Located in [`fiscalzen-app/src/types/index.ts`](../../AppData/Local/Programs/Antigravity/fiscalzen-app/src/types/index.ts), the `Usuario` interface defines the user object that represents authenticated users in the application.

```ts
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
  roles: string[]; // Example: ["ADMIN", "USER"]
}
```

---

### `AuthState` Interface

Defined in [`fiscalzen-app/src/hooks/useStore.ts`](../../AppData/Local/Programs/Antigravity/fiscalzen-app/src/hooks/useStore.ts), `AuthState` manages authentication and session data in the client-side store.

```ts
interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // ...additional fields or methods
}
```

`AuthState` helps track the current user's login state and manage actions such as login and logout in a centralized manner, typically using a store (like Zustand, Redux, or Context API).

---

### Backend Authentication

The backend (found under [`fiscalzen-api/src`] and related files) manages user credentials, token issuing, and validation. Authentication endpoints typically include:

- `POST /auth/login` - Accepts user credentials, validates them, and responds with a JWT or session token.
- Authenticated routes require an `Authorization: Bearer <token>` header.

---

## Authentication Flow

1. **Login Request**:  
   The user submits their email and password through the UI.
2. **Token Issuance**:  
   The frontend calls the backend `/auth/login` endpoint, sending the credentials.
3. **Token Storage**:  
   On successful login, the backend returns either a JWT or opaque token. The frontend stores this token in memory (via `AuthState`) or a secure storage.
4. **Authenticated Requests**:  
   For subsequent API calls, the frontend includes the token in the `Authorization` header.
5. **Logout**:  
   The frontend clears user and token data from `AuthState` and (optionally) notifies the server.

---

## Practical Example

### Login

```ts
// Example login function in AuthState
async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" }
  });
  if (response.ok) {
    const { token, usuario } = await response.json();
    // Set state: isAuthenticated = true, store token and usuario
  } else {
    // Handle error
  }
}
```

### Using Authenticated API Calls

```ts
const authState = useStore((state) => state.auth);

fetch("/api/protected/data", {
  headers: {
    Authorization: `Bearer ${authState.token}`
  }
});
```

### Logout

```ts
function logout() {
  // Clear user and token from AuthState
  // Optionally redirect user to the login screen
}
```

---

## Extending and Integrating

- **Adding New Auth Methods**:  
  Add new authentication providers (e.g., OAuth, SAML) by extending `AuthState` with new login/logout methods and adjusting backend endpoints as needed.
- **Token Refresh**:  
  For long-lived sessions, implement token refresh logic by adding a method to `AuthState` and a corresponding endpoint on the backend.
- **Roles and Permissions**:  
  Use the `roles` array in `Usuario` to show/hide UI elements or guard routes in your app.

---

## Related Files and Symbols

- [`fiscalzen-app/src/types/index.ts`] — User-related types such as `Usuario`.
- [`fiscalzen-app/src/hooks/useStore.ts`] — App state for authentication (`AuthState`) and actions.
- Backend: `fiscalzen-api/src/app.controller.ts` and authentication routes.

---

## FAQ

**Q: Where is the authentication token stored?**  
A: In the application state (`AuthState`). Avoid storing it in persistent, insecure storage such as localStorage.

**Q: How are user roles enforced?**  
A: The frontend (using `roles` from `Usuario`) and the backend (checking roles in the token) both enforce roles and permissions.

---

## See Also

- [User and Session Interfaces](../../AppData/Local/Programs/Antigravity/fiscalzen-app/src/types/index.ts)
- [Authentication State Management](../../AppData/Local/Programs/Antigravity/fiscalzen-app/src/hooks/useStore.ts)
- [Backend API Example](../../fiscalzen-api/src/app.controller.ts)

---

For further guidance or contribution, see the related source files, implement tests for your new authentication features, and review role management to match your organization's security requirements.
