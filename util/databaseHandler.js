import mongodb from 'mongodb';


const config = JSON.parse(fs.readFileSync('./config.json','utf-8'));

mongodb.connect(config.MONGO_STRING)