const express = require('express');
const { LxeSchema, RadioSchema } = require('../Models/Radio&Lxe');
const verifyAdmin = require('../Middleware/Adminware');

const router = express.Router();

// Route to add a new LXC
router.post('/post-lxe',verifyAdmin, async(req, res) => {
    const {lxeNumber} = req.body;
    console.log(lxeNumber)
    try{
      const findLxe= await LxeSchema.findOne({lxe_number:lxeNumber})
      if(findLxe) return res.status(400).json({message:"LXC already exist"})
      const LxeNumber= await LxeSchema.insertMany({lxe_number:lxeNumber}) 
    res.status(200).send({ message: 'New LXC added successfully', data:LxeNumber });
     console.log(LxeNumber)
    }catch(error){
        res.status(500).json({message:"Failed to add LXC",error})
    }
    
});

router.delete("/lxe/:id",verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if LXE exists
      const lxe = await LxeSchema.findById(id);
      if (!lxe) {
        return res.status(404).json({ message: "LXE not found" });
      }
  
      // Delete the LXE
      await LxeSchema.findByIdAndDelete(id);
      res.status(200).json({ message: "LXE deleted successfully" });
    } catch (error) {
      console.error("Error deleting LXE:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Route to add a new Radio
router.post('/post-radio',verifyAdmin,async (req, res) => {
    const {radioNumber} = req.body;
    
    try{
        const findRadio= await RadioSchema.findOne({radio_number:radioNumber})
      if(findRadio) return res.status(400).json({message:"Radio already exist"})
        const RadioNumber= await RadioSchema.insertMany({radio_number:radioNumber}) 
    res.status(200).send({ message: 'New Radio added successfully', data: RadioNumber });
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Failed to add Radio",error}) 
    }

});

router.delete("/radio/:id",verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if LXE exists
      const lxe = await RadioSchema.findById(id);
      if (!lxe) {
        return res.status(404).json({ message: "Radio not found" });
      }
  
      // Delete the LXE
      await RadioSchema.findByIdAndDelete(id);
      res.status(200).json({ message: "Radio deleted successfully" });
    } catch (error) {
      console.error("Error deleting Radio:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


router.get('/get-lxes',verifyAdmin,async(req, res) => {
    
    try{

      const lxeNumber= await LxeSchema.find({}) 
    res.status(200).json(lxeNumber);

    }catch(error){
      console.log(error)
        res.status(500).json({message:"Failed to add LXE",error})
    }
    
});

router.get('/get-radios',verifyAdmin, async(req, res) => {
    
    try{

      const radioNumber= await RadioSchema.find({}) 
      res.json(radioNumber);

    }catch(error){
        res.status(500).json({message:"Failed to add Radio",error})
    }
    
});

module.exports = router;