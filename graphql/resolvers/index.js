const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

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

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);

        return {...event._doc, creator: user.bind(this, event.creator)}
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
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                }
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
    },
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: '5f0721d8351c4b37fca99f8e',
            event: fetchedEvent
        });
        const result = await booking.save();

        return {
            ...result._doc,
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {...booking.event._doc, creator: user.bind(this, booking.event._doc.creator)};

            await Booking.deleteOne({_id: args.bookingId});

            return event
        } catch (err) {
            throw err
        }
    }
};