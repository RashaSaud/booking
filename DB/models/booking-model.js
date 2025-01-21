const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const booking_model = new mongoose.Schema({
  name:{type:String,default:''},
  email: { type: String  },
  isAccepted :{type:Boolean,default:false },
  startTime:{type:String},
  endTime:{type:String},
  commpanyName:{type:String},
meetingRoom:{type:String},
date:{type:String},
isHide:{type:Boolean,default:false},
isGround:{type:Boolean,default:false},
program:{type:String}
});

module.exports = mongoose.model("booking_model", booking_model);
