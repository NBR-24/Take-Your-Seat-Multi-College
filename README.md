# Take Your Seat - Train Booking Platform

A comprehensive industrial-visit train ticket booking platform built with React, Firebase Firestore, and TailwindCSS. Features real-time seat booking, admin management, and mobile-responsive design.

## 🚀 Features

### Core Functionality
- **Real-time Seat Booking**: Live updates across all users using Firestore's onSnapshot
- **Multi-Bogie Support**: S3, S5, S7 bogies with 80 seats each
- **Seat Layout**: Realistic train layout (3 seats left + 1 side berth right per row)
- **Seat Types**: Lower, Middle, Upper, Side Lower, Side Upper berths
- **One Seat Per Person**: Email/phone validation prevents duplicate bookings
- **Optimistic Locking**: Transaction-based booking prevents race conditions

### User Interface
- **Mobile-First Design**: Responsive layout optimized for all devices
- **Color-Coded Seats**: 
  - 🟢 Available
  - 🔴 Booked
  - 🟡 Reserved (Faculty)
  - 🔵 Selected
- **Interactive Tooltips**: Hover to see seat details and booking info
- **Real-time Updates**: Instant seat status changes across all browsers

### Admin Panel
- **Password Protection**: Secure admin authentication
- **Booking Management**: View, search, filter, and cancel bookings
- **Seat Reservations**: Reserve/unreserve seats for faculty
- **CSV Export**: Download booking data for external use
- **Real-time Dashboard**: Live statistics and booking updates

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting (ready to deploy)
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Routing**: React Router DOM
