const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');


const comicSchema = new mongoose.Schema({
    comicId: {
        type: String,
        required: [true, 'Please enter a comic ID.'],
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'Please enter a title.'],
        unique: true,
    },
    price: {
        type: Decimal128,
        required: [true, 'Please enter a price.']
    },
    brand: {
        type: String,
        required: [true, 'Please enter a brand.']
    },
    publisher: {
        type: String,
        required: [true, 'Please enter a publisher.']
    },
    artist: {
        type: String,
        required: [true, 'Please enter an artist.']
    },
    coverArtist: {
        type: String,
        required: false
    },
    writer: {
        type: String,
        required: [true, 'Please enter a writer.']
    },
    inventoryAmount: {
        type: Number,
        required: [true, 'Please enter the amount currently in inventory.']
    }

});


const Comic = mongoose.model('comic', comicSchema);

module.exports = Comic;
