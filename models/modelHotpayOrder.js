const mongoose = require('mongoose');

const HotpayOrderSchema = mongoose.Schema({
  type: {
    type: String
  },
  id: {
    type: String
  },
  item: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
},{
  toObject: {virtuals:true}
});
const HotpayOrderList = mongoose.model('t_order_list', HotpayOrderSchema);
module.exports = HotpayOrderList;

