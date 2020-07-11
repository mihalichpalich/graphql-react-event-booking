const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
    createUser: async args => {
        try {
            const existingUser = await User.findOne({email: args.userInput.email});

            if (existingUser) {
                throw new Error('User exists already.')
            }

            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const res = await user.save();

            return {...res._doc, password: null}
        } catch (err) {
            throw err
        }
    },
    login: async ({email, password}) => {
        const user = await User.findOne({email: email});

        if (!user) {
            throw new Error('User does not exists!')
        }

        const isHashEqual = await bcrypt.compare(password, user.password);

        if (!isHashEqual) {
            throw new Error('Password is incorrect!')
        }

        const token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_SECRET_KEY,
            {expiresIn: '1h'}
        );

        return {userId: user.id, token: token, tokenExpiration: 1}
    }
};