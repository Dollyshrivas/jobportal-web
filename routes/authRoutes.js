const express = require("express");
const router = express.Router();
const userSchema=require("../models/userschema")
const applySchema = require("../models/applyschema")
const bcrypt = require("bcryptjs")
const protectRoute = require("../middleware/protectRoute");
const guestRoute = require("../middleware/guestRoute");
const nodemailer = require("nodemailer");

// nodemailer credentials
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "6da2e0ae4c3f37",
    pass: "724d3be6a200e7"
  }
});

//loginpage
router.get("/loginpage", guestRoute,(req, res) => {
  res.render("login")
});

//registerpage
router.get("/registerpage", guestRoute,async(req,res) =>{
  res.render("register")
})

//forgotpassword name
router.get("/forgotpassword",guestRoute,(req,res)=>{
  res.render("forgotpassword")
})

//resetpasswordpage
router.get("/resetpassword/:token",guestRoute,async(req,res)=>{
  const{token}=req.params;
  const user = await userSchema.findOne({token});

  if(!user){
    req.flash('error','Link has been expired');
    return res.redirect("/forgotpassword");
  }

  res.render("resetpassword",{token});
});

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
router.get("/profilepage", protectRoute, async (req, res) => {
  try {
    const applications = await applySchema
      .find({ userId: req.session.user._id })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.render("profile", {
      user: req.session.user,
      applications,
    });
  } catch (error) {
    console.error(error);
    res.render("profile", {
      user: req.session.user,
      applications: [],
    });
  }
});

//logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/profilepage");
    }
    res.redirect("/loginpage");
  });
});

//handling login page
router.post("/loginpage",async (req,res)=>{
  const { email, password } = req.body;

  try {
    const user = await userSchema.findOne({email});

    if (user && (await bcrypt.compare(password, user.password))){
      req.session.user = user;
      res.redirect("/");
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

//after login
router.get("/job_profile", protectRoute, (req, res) => {
  res.render("job_profile", {
    user: req.session.user,
    jobs: []
  });
})

//handling forget password
router.post("/forgotpassword", async(req,res)=>{
  const{ email }=req.body;
  try {
    const user = await userSchema.findOne({ email });

    if(!user){
      req.flash("error", "User not found with this email!");
      return res.render("forgotpassword");
    }

    const token = Math.random().toString(36).slice(2);
    user.token = token;
    await user.save();

    const info = await transport.sendMail({
    from: '"Job Portal" <dollyshrivas2005@gmail.com>',
    to: email,
    subject: "Password reset",
    text: "Reset your password", // Plain-text version of the message
    html: `<p>Click this link to reset password: 
    <a href='http://localhost:5000/resetpassword/${token}'>Reset Password</a>
    <br>Thank you</br>
    </p>`, // HTML version of the message
  });

  if(info.messageId){
    req.flash('success','Password link has been sent to email!!');
    res.redirect("/forgotpassword");
  } else {
    req.flash('error','Error has come in sending email');
    res.redirect("/forgotpassword")
  }

  } catch (error) {
    console.error(error);
    req.flash('error','Something went wrong, try again!');
    res.redirect("/forgotpassword")
    
  }
})

//handling resetpassword post request
router.post("/resetpassword/:token", async (req, res) => {
  const { token } = req.params;
  const { new_password, confirm_new_password } = req.body;

  if (new_password !== confirm_new_password) {
    req.flash("error", "Passwords do not match");
    return res.redirect(`/resetpassword/${token}`);
  }

  const user = await userSchema.findOne({ token });
  if (!user) {
    req.flash("error", "Invalid or expired link");
    return res.redirect("/forgotpassword");
  }

  user.password = await bcrypt.hash(new_password, 10);
  user.token = null;
  await user.save();

  req.flash("success", "Password reset successful");
  res.redirect("/loginpage");
});




module.exports = router;