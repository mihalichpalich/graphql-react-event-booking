const {buildSchema} = require('graphql');

//events: [Event!]! возвращает массив не null из объектов не null
//input - объект, объединяющий несколько типов, создается для мутаций
//ID - специальный тип
//типа Date не существует
module.exports = buildSchema(`
        type Booking {
            _id: ID!
            event: Event!
            user: User!
            createdAt: String!
            updatedAt: String!
        }

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }
        
        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!            
        }
        
        input UserInput {
            email: String!
            password: String!          
        }
    
        type RootQuery {
            events: [Event!]!
            bookings: [Booking!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
            bookEvent(eventId: ID!): Booking!
            cancelBooking(bookingId: ID!): Event!
        }
    
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `
);