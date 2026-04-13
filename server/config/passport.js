import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export const configurePassport = () => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
    
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                let user = await User.findOne({ email });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.name = user.name || profile.displayName;
                        await user.save();
                    }
                    return done(null, user);
                }

                user = await User.create({
                    email,
                    googleId: profile.id,
                    username: email,
                    name: profile.displayName
                });

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));
}



export default passport;