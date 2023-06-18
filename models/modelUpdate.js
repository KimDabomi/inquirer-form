const mongoose = require('mongoose');


// update schema
const UpdateSchema = mongoose.Schema({
  username: {
    type: String
  },
  phone: {
    type: String
  },
  url: {
    type: String
  }
},{
  toObject: {virtuals:true}
});
const UpdateUser = mongoose.model('UpdateUser', UpdateSchema);
module.exports = UpdateUser;

