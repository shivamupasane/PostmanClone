# API Testing Tool

## Overview

This is a full-stack web application that functions as an API testing tool, similar to Postman. It allows users to create collections, organize HTTP requests, execute API calls, and view responses. The application features a modern React frontend with a Node.js/Express backend and PostgreSQL database for persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database queries and migrations
- **API Design**: RESTful API with CRUD operations for collections, requests, and history
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development**: Hot module replacement with Vite integration for seamless development experience

### Database Schema
- **Collections**: Store request collections with name, description, and timestamps
- **Requests**: Store individual HTTP requests linked to collections, including method, URL, headers, parameters, and body
- **Request History**: Track executed requests with response metadata for historical reference
- **Primary Keys**: UUID generation using PostgreSQL's `gen_random_uuid()` function

### Data Flow and Storage
- **In-Memory Fallback**: MemStorage class provides in-memory storage as a fallback when database is unavailable
- **Type Safety**: Shared schema definitions between frontend and backend using Drizzle-Zod integration
- **Data Persistence**: PostgreSQL with connection pooling via Neon serverless driver

### Authentication and Security
- **Session Management**: Express session configuration with PostgreSQL session store (connect-pg-simple)
- **CORS**: Configured for cross-origin requests with credentials support
- **Input Validation**: Zod schemas for request validation on both client and server

### Key Features
- **Request Builder**: Dynamic form interface for constructing HTTP requests with support for parameters, headers, and request body
- **Response Viewer**: Syntax-highlighted response display with multiple view modes (pretty, raw, preview)
- **Collection Management**: Hierarchical organization of requests within collections
- **Request History**: Automatic tracking of executed requests with response metadata
- **Real-time Updates**: Live request/response timing and status information

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL with Neon serverless driver for cloud-native database connectivity
- **Session Store**: PostgreSQL-backed session storage for user session persistence

### UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach

### Development and Build Tools
- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Code Quality**: ESBuild for fast bundling and minification

### HTTP Client Features
- **Request Execution**: Native Fetch API with timeout support and request cancellation
- **Response Processing**: Automatic content-type detection and JSON parsing
- **Error Handling**: Comprehensive error handling for network failures and HTTP errors

### Form and Validation
- **Form Management**: React Hook Form for performant form handling
- **Schema Validation**: Zod for runtime type checking and validation
- **Resolver Integration**: Hookform resolvers for seamless Zod integration