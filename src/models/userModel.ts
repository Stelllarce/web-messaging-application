import { Schema, model } from 'mongoose';

export const userSchema = new Schema({
	id: Schema.Types.ObjectId,

	username: {
		type: Schema.Types.String,
		required: true
	},
    
    password: {
		type: Schema.Types.String,
		required: true
	}
});

export const UserModel = model('User', userSchema);