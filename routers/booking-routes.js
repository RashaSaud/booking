const express = require("express");
const BookingRoute = express.Router();
const userModel = require('../DB/models/user-model')
const {login,sendBooking,acceptedBooking,deleteAllBookings,signUp,deleteBooking,changePassword,getBookingById,getAllBooking} = require('../controller/login-controller')
BookingRoute.post('/new-book',sendBooking)
BookingRoute.put('/accetp-booking/:id',acceptedBooking)
BookingRoute.post('/Login',login)
BookingRoute.post('/sign-up',signUp )
BookingRoute.put('/change-password',changePassword)
BookingRoute.delete('/delete-all-booking',deleteAllBookings)
BookingRoute.put('/hidden-the-book',deleteBooking)
BookingRoute.get('/get-all-booking',getAllBooking)
BookingRoute.get('/get-booking-by-id/:id',getBookingById)

module.exports = BookingRoute;
   