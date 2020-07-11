const Event = require('../../models/event');
const User = require('../../models/user');
const {transformEvent} = require('./merge');

module.exports = {
    events: async () => { //имя resolve ф-ии должно совпадать с именем типа и она всегда должна что-то возвращать
        try {
            const events = await Event.find();

            return events.map(event => {
                return transformEvent(event)
            })
        } catch (err) {
            throw err
        }
    },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated user!')
        }

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price, //"+" переводит строку в число
            date: new Date(args.eventInput.date),
            creator: req.userId
        });
        let createdEvent;

        try {
            const result = await event.save();

            createdEvent = transformEvent(result);

            const creator = await User.findById(event.creator);

            if (!creator) {
                throw new Error('User not found.')
            }

            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent
        } catch(err) {
            throw err;
        }
    }
};