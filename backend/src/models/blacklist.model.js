const mongoose = require('mongoose');
// This model is used to store the blacklisted tokens in the database. Whenever a user logs out, the token is added to the blacklist collection and it will be checked for every request to ensure that the token is not blacklisted.


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true,"token is required to blacklist"]
    },
    blacklistedAt: {
        type: Date,
        default: Date.now
    }
});


const blacklistTokenModel = mongoose.model("blacklistTokens", blacklistTokenSchema);
module.exports = blacklistTokenModel;