const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

//ф-ии events и user нужны для получения списка сущностей по связанным ключам
const events = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});

        return events.map(event => {
            return {
                ...event._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        })
    } catch(err) {
        throw err
    }
};

const user = async userId => {
    try {
        const user = await User.findById(userId);

        return {...user._doc, createdEvents: events.bind(this, user._doc.createdEvents)}
    } catch (err) {
        throw err
    }
};

module.exports = {
    events: async () => { //имя resolve ф-ии должно совпадать с именем типа и она всегда должна что-то возвращать
        try {
            const events = await Event.find();

            return events.map(event => {
                return {...event._doc, creator: user.bind(this, event._doc.creator)}
            })
        } catch (err) {
            throw err
        }
    },
    createEvent: async args => {
    const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price, //"+" переводит строку в число
        date: new Date(args.eventInput.date),
        creator: '5f0721d8351c4b37fca99f8e'
    });
    let createdEvent;

    try {
        const result = await event.save();

        createdEvent = {
            ...res._doc,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, res._doc.creator)
        };

        const creator = await User.findById('5f0721d8351c4b37fca99f8e');

        if (!creator) {
            throw new Error('User not found.')
        }

        creator.createdEvents.push(event);
        await creator.save();
        return createdEvent
    } catch(err) {
        throw err;
    }
},
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
    }
};