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

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Take-Your-Seat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Firebase Hosting (optional)
   - Copy your Firebase config from Project Settings

4. **Configure Firebase**
   - Update `src/config/firebase.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

5. **Set up Firestore Security Rules**
   - In Firebase Console, go to Firestore Database > Rules
   - Copy the rules from `firestore.rules` file

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```
   - Select Hosting
   - Choose your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Set up automatic builds: No

4. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 📱 Usage

### For Users
1. Visit the application URL
2. Select a bogie (S3, S5, or S7)
3. Click on an available (green) seat
4. Fill in your details (name, email, phone)
5. Confirm your booking

### For Admins
1. Click "Admin" in the navigation
2. Enter the secure admin password
3. Access booking management and seat reservations
4. Export bookings as CSV
5. Reserve seats for faculty

## 🔧 Configuration

### Admin Password
Change the admin password in `src/components/AdminLogin.jsx`:
```javascript
const ADMIN_PASSWORD = 'your-secure-password';
```

### Bogie Configuration
Modify available bogies in `src/pages/BookingPage.jsx`:
```javascript
const [bogies] = useState(['s3', 's5', 's7', 's9']); // Add more bogies
```

### Seat Layout
Customize seat layout in `src/utils/seatLayout.js`:
```javascript
// Modify generateSeatLayout() function for different configurations
```

## 🔒 Security Features

- **Firestore Security Rules**: Prevent unauthorized data access
- **Input Validation**: Client and server-side validation
- **Transaction-based Booking**: Prevents double booking
- **Email/Phone Uniqueness**: One booking per person
- **Admin Authentication**: Password-protected admin panel

## 📊 Database Structure

### Collections

#### `bogies/{bogieId}`
```javascript
{
  id: "s1",
  name: "S1",
  seats: [...], // Array of 80 seat objects
  totalSeats: 80,
  bookedSeats: 15,
  reservedSeats: 5,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `bookings/{bookingId}`
```javascript
{
  id: "s1_seat1_timestamp",
  bogieId: "s1",
  seatId: "1",
  seatNumber: 1,
  seatType: "LOWER",
  userName: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  bookedAt: timestamp,
  status: "confirmed"
}
```

## 🎨 Customization

### Colors
Modify seat colors in `src/index.css`:
```css
.seat-available { @apply bg-green-100 border-green-300; }
.seat-booked { @apply bg-red-100 border-red-300; }
.seat-reserved { @apply bg-yellow-100 border-yellow-300; }
.seat-selected { @apply bg-blue-200 border-blue-400; }
```

### Layout
Adjust responsive breakpoints in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    screens: {
      'xs': '475px',
      // Add custom breakpoints
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify Firebase config in `src/config/firebase.js`
   - Check if Firestore is enabled in Firebase Console

2. **Real-time Updates Not Working**
   - Ensure Firestore security rules are properly configured
   - Check browser console for errors

3. **Booking Fails**
   - Verify seat is still available
   - Check email/phone uniqueness
   - Ensure proper validation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Firebase documentation

---

**Built with ❤️ for seamless train booking experiences**