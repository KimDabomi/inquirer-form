const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
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
const OrderList = mongoose.model('t_order_list', OrderSchema);
module.exports = OrderList;

