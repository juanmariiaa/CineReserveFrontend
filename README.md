# CineReserve Frontend

![Angular](https://img.shields.io/badge/Angular-19-DD0031)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)
![Material UI](https://img.shields.io/badge/Angular%20Material-19-607D8B)
![Stripe](https://img.shields.io/badge/Stripe-Payments-6772E5)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## 📋 Overview

CineReserve Frontend is a modern, responsive web application built with Angular 19 that provides an intuitive interface for movie enthusiasts to browse films, view screening schedules, reserve seats, and complete ticket payments. This application interfaces with the CineReserve Backend API to deliver a comprehensive cinema booking experience.

## ✨ Features

- **User Authentication**

  - JWT-based authentication
  - Login/Register functionality
  - Social media authentication integration
  - Profile management

- **Movie Exploration**

  - Browse movie catalog with filtering options
  - View detailed movie information
  - See trailers and ratings
  - Filter by genre, duration, and screening time

- **Cinema Experience**

  - Interactive seat selection
  - Real-time seat availability
  - Room visualization
  - Screening schedule with calendar view

- **Reservation System**

  - Multi-seat selection
  - Reservation summary
  - User reservation history
  - Ticket status tracking

- **Secure Payment Processing**

  - Stripe payment integration
  - Secure checkout experience
  - Payment confirmation
  - Digital ticket delivery

- **Responsive Design**
  - Mobile-friendly interface
  - Adaptive layouts
  - Optimized for various screen sizes
  - Consistent user experience across devices

## 🛠️ Technologies

- **Angular 19** - Frontend framework
- **TypeScript 5.7** - Programming language
- **Angular Material 19** - UI component library
- **RxJS** - Reactive programming
- **Angular JWT** - Token handling
- **Angular Social Login** - Social authentication
- **Stripe.js** - Payment processing

## 📦 Project Structure

```
CineReserveFrontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/ - Route protection
│   │   │   ├── interceptors/ - HTTP request handling
│   │   │   ├── models/ - Data models
│   │   │   ├── services/ - API services
│   │   │   └── social-auth/ - Social login integration
│   │   ├── features/
│   │   │   ├── admin/ - Admin dashboard components
│   │   │   ├── auth/ - Authentication components
│   │   │   ├── home/ - Home page components
│   │   │   ├── movies/ - Movie-related components
│   │   │   ├── payment/ - Payment processing components
│   │   │   ├── public/ - Public facing components
│   │   │   ├── reservation/ - Seat reservation components
│   │   │   ├── shared/ - Shared UI components
│   │   │   └── user/ - User profile components
│   │   ├── app.routes.ts - Application routing
│   │   └── app.config.ts - Application configuration
│   ├── assets/ - Static assets
│   └── environments/ - Environment configurations
└── angular.json - Angular workspace configuration
```

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Angular CLI 19.x

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/juanmariiaa/CineReserveFrontend.git
cd CineReserveFrontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create appropriate environment files in the `src/environments/` directory:

**environment.ts** (Development)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/api",
  stripePublicKey: "pk_test_your_stripe_test_key",
};
```

**environment.prod.ts** (Production)

```typescript
export const environment = {
  production: true,
  apiUrl: "https://your-production-api.com/api",
  stripePublicKey: "pk_live_your_stripe_live_key",
};
```

### 4. Development Server

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/` to access the application.

### 5. Building for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## 🔄 Key Features Implementation

### Authentication Flow

The application uses JWT-based authentication with token storage in local storage. The auth service manages login, registration, and token validation.

### Movie Browsing and Filtering

Users can browse movies with various filtering options:

- By title (search)
- By genre
- By date
- By rating
- By screening availability

### Seat Reservation Process

1. User selects a movie and screening time
2. System displays the theater room with available seats
3. User selects desired seats
4. System generates a reservation and proceeds to payment

### Stripe Payment Integration

1. The frontend creates a payment session via the backend
2. User is redirected to Stripe Checkout
3. After successful payment, user is redirected back to the application
4. Ticket is generated and displayed to the user
5. Ticket is also sent via email

## 🚢 Deployment

The Angular application can be deployed on various hosting platforms:

1. **Static Hosting** (Netlify, Vercel, GitHub Pages):

   - Build the application with `ng build --configuration production`
   - Upload the contents of the `dist/` directory

2. **Docker Deployment**:

   - Use the provided Dockerfile to build a container
   - Deploy the container to your hosting environment

3. **CI/CD Pipelines**:
   - Configure CI/CD to build and deploy on code changes

## 🔐 Security Considerations

- JWT tokens are stored securely
- HTTP Interceptors handle authentication headers
- Route Guards protect restricted routes
- Sensitive data is never stored in client-side storage

## 📱 Responsive Design

The application is designed to be fully responsive:

- Mobile-first approach
- Adaptive layouts using Angular Material's grid system
- Media queries for custom styling
- Touch-friendly interactions for mobile users

## 📞 Contact

Juan Maria - [GitHub Profile](https://github.com/juanmariiaa)

Project Link: [https://github.com/juanmariiaa/CineReserveFrontend](https://github.com/juanmariiaa/CineReserveFrontend)
