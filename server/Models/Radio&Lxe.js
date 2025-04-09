const {Schema,model} = require('mongoose')

const radioSchema = new Schema({
  radio_number: { type: String, required: true },
  

});


 const lxeSchema = new Schema({
 lxe_number: {type: String},

});
const LxeSchema = model('Lxe', lxeSchema);
const RadioSchema = model('Radio', radioSchema);

module.exports = {RadioSchema, LxeSchema}