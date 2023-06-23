const mongoose = require('mongoose');

const InquirerSchema = mongoose.Schema({
  type: {
    type: String
  },
  username: {
    type: String
  },
  phone: {
    type: String
  },
  url: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
},{
  toObject: {virtuals:true}
});
const InquirerList = mongoose.model('t_inquirer_list', InquirerSchema);
module.exports = InquirerList;

