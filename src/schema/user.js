import mongoose from 'mongoose';
import validator from 'email-validator';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
      trim: true,
      validate: {
        validator: (email) => validator.validate(email),
        message: 'Invalid email format',
      },
    },

    password: {
      type: String,
      required: true,
      minLength: 5,
    },
  },
  { timestamps: true }
);

const user = mongoose.model('User', userSchema); // user collection

export default user;
