const User=require("../models/user.js")




module.exports.signup=async(req, res)=>{
    try{
    let { username , email , password}=req.body;
    const newUser= new User({email, username});
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
         req.flash("sucess" , "welcome to wanderlust");
         res.redirect("/listings")

    })
   
    } catch(e) {
        req.flash("error" , e.message);
        res.redirect("/signup");

    }

};
module.exports.renderSignupForm=(req, res)=>{
    res.render("users/signup.ejs")
};

module.exports.renderLoginForm=(req, res)=>{
    res.render("users/login.ejs")
}

module.exports.Login=async(req, res)=>{
    req.flash("sucess" ,"Welcome to Wanderlust!");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

};

module.exports.logout=async(req, res, next )=>{
req.logout((err)=>{
    if(err){
        return next(err);
    }
    req.flash("sucess", "You are successfully loggout")
    res.redirect("/listings");
})
}