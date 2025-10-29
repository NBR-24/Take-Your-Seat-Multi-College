# 🚂 Take Your Seat - Multi-College Train Booking Platform

A modern, scalable train ticket booking platform designed for educational institutions' industrial visits. Each college can create their own isolated booking system with a unique college code, complete with real-time seat management and admin controls.

## ✨ **What's New - Multi-College Support!**

Transform from a single-college platform to a **multi-tenant SaaS solution**:
- 🏫 **Unlimited Colleges** - Any institution can create their own booking system
- 🔐 **Complete Data Isolation** - Each college's data is completely separate
- 🎨 **Custom Branding** - College logos and names
- 🔑 **Unique College Codes** - 6-digit codes for easy access
- ⚙️ **Flexible Configuration** - Customizable routes, bogies, and seat counts
- 🎛️ **Advanced Seat Management** - Admins can mark seats as Available/Reserved/Unavailable

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
- **Password Protection**: Per-college admin authentication
- **Booking Management**: View, search, filter, and cancel bookings
- **Seat Management Tab**: Visual grid to toggle seat status (Available/Reserved/Unavailable)
- **CSV Export**: Download booking data for external use
- **Real-time Dashboard**: Live statistics and booking updates
- **Multi-Route Support**: Manage multiple routes from single dashboard

### College Setup
- **3-Step Wizard**: Easy college onboarding process
- **Custom Configuration**: Set bogies, seats per bogie, and routes
- **Unique Code Generation**: Automatic 6-digit college code
- **Logo Support**: Optional college logo upload
- **Multiple Routes**: Support for multiple train routes per college

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Database**: Firebase Realtime Database
- **Hosting**: Firebase Hosting (ready to deploy)
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Routing**: React Router DOM
- **State Management**: React Context API
