const booking_model = require("../DB/models/booking-model");
const nodemailer = require("nodemailer");
const userModel = require("../DB/models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // Avoid revealing if email exists
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res
      .status(200)
      .json({ user: { email: user.email, password: user.password } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const findEmail = await userModel.findOne({ email: email });
  if (!findEmail) {
    return res.status(403).send("No user with this email");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updateResult = await userModel.findOneAndUpdate(
    { email: findEmail },
    { password: hashedPassword },
    { new: true }
  );

  if (updateResult.modifiedCount === 0) {
    return res.status(500).json({ message: "Failed to update password" });
  }

  // 6. (Optional) Generate a new JWT after password change
  res.status(200).json({ message: "Password changed successfully" });
};

// const sendMailWithNodeMailer = async (req,res)=>{
//     try {
//       const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         auth: {
//           user: 'h.alnefaie@thegarage.sa',
//      pass: 'zlgimxaktkbbnpwu',
//   }
//       });

//       const messageData = {
//         to: email,
//         from: 'Garage-operations <h.alnefaie@thegarage.sa>',
//         subject:`Meeting Room Booking ${isAccepted == true ? "Confirmation" : "Cancellation"}`
//         ,
//         text: ``,
//         html: `<html>
//       <body>
//         <p>Dear ${update.name},</p>
//         <p>This email is to inform you about the status of your recent meeting room booking request.</p>
//         <p><strong>Booking Details:</strong> ${update.commpanyName} - ${update.meetingRoom}</p>
//         <p><strong>Status:</strong> ${isAccepted === true ? 'Confirmed' : 'Cancelled'}</p>
//         ${
//           isAccepted === true
//             ? `<p>Your booking for the meeting room on [Date of Booking] from [Start Time] to [End Time] has been confirmed.</p>
//                 <p>The room is now reserved for your use.</p>`
//             : `<p>We regret to inform you that your booking for the meeting room on [Date of Booking] has been cancelled.</p>`
//         }
//         <p>Sincerely,</p>
//         <p>The Garage Team</p>
//       </body>
//     </html>

//         `
//       }

//       const info = await transporter.sendMail(messageData);
//       res.status(200).send(`Email sent: ${info.response}`)
//     } catch (error) {
//       console.error('Error sending email:', error);

//     }
//   }

const acceptedBooking = async (req, res) => {
  try {

    
    const bookingId = req.params.id;
    const { isAccepted } = req.body;
    console.log(isAccepted);

    const update = await booking_model.findOneAndUpdate(
      { _id: bookingId },
      { isAccepted: isAccepted },
      { new: true }
    );

    if (update) {
      console.log(update);
      
      // const transporter = nodemailer.createTransport({
      //   host: "smtp.gmail.com",
      //   port: 587,
      //   secure: false,
      //   auth: {
      //     user: "h.alnefaie@thegarage.sa",
      //     pass: "zlgimxaktkbbnpwu",
      //   },
      // });

      // const messageData = {
      //   to: update.email,
      //   from: "Garage-operations <h.alnefaie@thegarage.sa>",
      //   subject: `Meeting Room Booking ${
      //     isAccepted == true ? "Confirmation" : "Cancellation"
      //   }`,
      //   text: ``,
      //   html: `<html>
      //     <body>
      //       <p>Dear ${update.name},</p>
      //       <p>This email is to inform you about the status of your recent meeting room booking request.</p>
      //       <p><strong>Booking Details:</strong> ${update.commpanyName} - ${
      //     update.meetingRoom
      //   }</p>
      //       <p><strong>Status:</strong> ${
      //         isAccepted === true ? "Confirmed" : "Cancelled"
      //       }</p>
      //       ${
      //         isAccepted === true
      //           ? `<p>Your booking for the meeting room on [Date of Booking] from [Start Time] to [End Time] has been confirmed.</p>
      //               <p>The room is now reserved for your use.</p>`
      //           : `<p>We regret to inform you that your booking for the meeting room on [Date of Booking] has been cancelled.</p>`
      //       }
      //       <p>Sincerely,</p>
      //       <p>The Garage Team</p>
      //     </body>
      //   </html>

      //       `,
      // };

      //   const info = await transporter.sendMail(messageData);
      console.log(update);
        res.status(200).json({ update });

        // res.status(200).send(`Email sent: ${info.response}`)
    } else {
      console.log(isAccepted);
      
    }
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Error updating booking" });
  }
};

const sendBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      startTime,
      endTime,
      commpanyName,
      meetingRoom,
      program,
    } = req.body;

    const isBasement = meetingRoom.toLowerCase().includes("basement");
    const meetingRoomNumber = meetingRoom.match(/\d+/)[0];
    console.log(meetingRoomNumber);

    const today = new Date();
    const formattedToday = today.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Check meeting room availability before creating a booking
    const isRoomAvailable = await checkMeetingRoomAvailability(
      meetingRoomNumber,
      startTime,
      endTime,
      formattedToday,
      isBasement
    );

    if (!isRoomAvailable) {
      return res.status(409).json({ message: "Meeting room is already booked for this time slot." });
    }

    const booking = new booking_model({
      name,
      email,
      startTime,
      endTime,
      commpanyName,
      meetingRoom: meetingRoomNumber,
      isGround:!isBasement,
      program,
      date: formattedToday,
    });

    const savedBooking = await booking.save();

    res.status(201).json(savedBooking); // Send the newly created booking as a response
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
};

// Function to check meeting room availability (implementation details depend on your database)
const checkMeetingRoomAvailability = async (meetingRoomNumber, startTime, endTime, date, isBasement) => {
  try {
    // 1. Query your database to find bookings for the specified meeting room on the given date
    const existingBookings = await booking_model.find({
      meetingRoom: meetingRoomNumber,
      date,
      $or: [
        { $and: [{ startTime: { $lte: endTime } }, { endTime: { $gte: startTime } }] }, // Overlapping time slots
        { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gte: endTime } }] }, // Meeting entirely within existing booking
      ],
    });

    // 2. Filter by floor if specified (assuming `isBasement` is a boolean)
    if (isBasement !== undefined) {
      existingBookings.filter((booking) => booking.isBasement === isBasement);
    }

    // 3. Check if any remaining bookings conflict with the requested time slot
    return existingBookings.length === 0;
  } catch (error) {
    console.error("Error checking meeting room availability:", error);
    // Consider returning a more informative error message to the user,
    // indicating a potential database issue.
    throw error; // Re-throw the error to trigger the main error handling block
  }
};

const deleteBooking = async (req, res) => {
  try {
    const now = new Date();

    const currentHour = String(now.getHours()).padStart(2, "0");
    const currentMinute = String(now.getMinutes()).padStart(2, "0");
    const currentTimeString = `${currentHour}:${currentMinute}`;

    const result = await booking_model.find({
      endTime: {
        $lte: currentTimeString,
      },
    });

    // res.status(200).json({
    //   message: `Deleted ${result.deletedCount} expired bookings.`,
    //   deletedCount: result.deletedCount,

    // });

    console.log(currentTimeString);
  } catch (error) {
    console.error("Error deleting expired bookings:", error);
    res.status(500).json({ message: "Failed to delete expired bookings." });
  }
};

const getAllBooking = async (req, res) => {
  const getData = await booking_model.find({});
  res.status(200).json(getData);
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const getBook = await booking_model.findById({ _id: id });
    if (!getBook) {
      return res.status(404).send("Booking not found");
    }
    res.status(200).send(getBook);
  } catch (error) {
    res.status(400).send(error);
  }
};

async function signUp(req, res) {
  try {
    const { email, password } = req.body;

    // Basic input validation (example)
    if (!email || !password || !email.trim() || !password.trim()) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check for duplicate email (example)
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10); // Use a secure environment variable for salt rounds

    // Create and save user
    const newUser = new userModel({ email, password: hashedPassword });
    const savedUser = await newUser.save();

    // Send sanitized response
    res.status(201).json({ userId: savedUser._id, email: savedUser.email }); // Include only relevant user information
  } catch (error) {
    console.error(error); // Log the full error for debugging
    res.status(500).json({ message: "Internal server error" }); // Send generic error message
  }
}

const deleteAllBookings = async (req, res) => {
  try {
    // Delete all bookings directly
    const result = await booking_model.deleteMany({});

    res
      .status(200)
      .json({
        message: "All bookings deleted successfully",
        deletedCount: result.deletedCount,
      });
  } catch (error) {
    console.error("Error deleting all bookings:", error);
    res.status(500).json({ message: "Error deleting bookings" });
  }
};

module.exports = {
  login,
  deleteAllBookings,
  sendBooking,
  signUp,
  acceptedBooking,
  getAllBooking,
  changePassword,
  getBookingById,
  deleteBooking,
};
