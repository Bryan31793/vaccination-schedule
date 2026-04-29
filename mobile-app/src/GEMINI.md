# Vaccination Schedule Mobile App

This project is a React Native mobile application for managing vaccination schedules, patients, and disease outbreaks.

## Tech Stack
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Navigation:** React Navigation (Native Stack, Bottom Tabs)
- **API Client:** Axios
- **Styling:** React Native StyleSheet with a custom theme

## Project Structure
- `src/api`: API client configuration and endpoint definitions.
- `src/components`: Reusable UI components.
- `src/navigation`: Navigation configuration and type definitions.
- `src/screens`: Application screens organized by feature.
- `src/theme`: Color palette, typography, and global styles.
- `src/types`: Global TypeScript interfaces and types.

## Development Conventions
- Use functional components and hooks.
- Follow the established theme in `src/theme`.
- Define navigation types in `src/navigation/types.ts`.
- Use the `apiClient` in `src/api/client.ts` for all network requests.
- Maintain a clean separation between UI and business logic.

## API Integration
- The app communicates with a backend service (default: `http://localhost:8080`).
- Uses HTTP Basic Authentication.
- API modules are located in `src/api/endpoints/`.
