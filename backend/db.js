const mongoose = require('mongoose');
const username = 'projectdatabase';
const password = 'anujdas123';

const connectionString =
  `mongodb+srv://projectdatabase:${password}@whiteboard.yvgzh1t.mongodb.net/whiteboard?retryWrites=true&w=majority`;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(connectionString);

    console.log('Connected to database successfully');
  } catch (error) {
    console.log('Database connection error:', error.message);
  }
};

module.exports = connectToDatabase;