const express = require("express");
const router = express.Router();
const userSchema=require("../models/userschema")
const bcrypt = require("bcryptjs")
const protectRoute = require("../middleware/protectRoute");

//loginpage
router.get("/loginpage", async (req, res) => {
  res.render("login")
});

//registerpage
router.get("/registerpage",async(req,res) =>{
  res.render("register")
})

//forgotpassword name
router.get("/forgotpassword",async(req,res)=>{
  res.render("forgotpassword")
})

//resetpasswordpage
router.get("/resetpassword",async(req,res)=>{
  res.render("resetpassword")
})

//resetbutton
router.get("/resetbutton",async(req,res)=>{
  res.send("Your password has been reset")
})

//handling registration page
router.post("/registerpage",async(req,res)=>{
  const { name , email , password} = req.body;

  try{
    const userExists = await userSchema.findOne({email})

  if(userExists){
    req.flash('error','User already exist through this email!!')
    return res.redirect("/registerpage")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new userSchema({
    name,
    email,
    password: hashedPassword
  })

  user.save();
  req.flash('success','User register succesfully,  you can login now!!')
  res.redirect('/registerpage')

}catch(error){

  }
})

//handling profilepage
router.get("/profilepage", protectRoute,(req,res)=>{
  res.render("profile",{
    user: req.session.user
  });
});
//handling login page
router.post("/loginpage",async (req,res)=>{
  const { email, password } = req.body;

  try {
    const user = await userSchema.findOne({email});

    if (user && (await bcrypt.compare(password, user.password))){
      req.session.user = user;
      res.redirect("/profilepage");
    }else{
      req.flash('error','Invalid email or password!');
      res.redirect("/loginpage");
    }
  }catch (error){
    console.error(error);
    req.flash('error','Something went wrong, try again!');
    res.redirect('/loginpage')
  }
})

module.exports = router;