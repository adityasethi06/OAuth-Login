const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../model/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then((user) => {
            done(null, user);
        })
        .catch(err => console.log(err))
});

passport.use(
    new GoogleStrategy({
    //options for startegy
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret:keys.google.clientSecret
    }, async (accessToken, refreshToken, profile, done) => {
        // check if user exsists already
        let currentUser = "";
        try {
            currentUser = await User.findOne({ googleId: profile.id });
        }catch (err){
            console.log("error occured while checking if user exists in db");
            console.log(err);
        }
        
        if(currentUser){
            console.log('user already exsists');
            done(null, currentUser);   
        }else {
            try{
                const newUser = await new User({
                    username: profile.displayName,
                    googleId: profile.id
                }).save()
                console.log("newUser has been saved in db"); 
                done(null, newUser);   
            }catch(err){
                console.log(err);
            }  
        }
        
    })
)

module.exports = passport;