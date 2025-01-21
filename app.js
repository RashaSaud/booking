

process.noDeprecation = true;
const express = require("express");
const app = express();
const cors = require("cors")
require("./DB/models/db");
app.use(express.json());
app.use(cors());


const BookingRoute = require('./routers/booking-routes')


app.use(BookingRoute) 


app.listen(8000,()=>{
    console.log("server is running");
})