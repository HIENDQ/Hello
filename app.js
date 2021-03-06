require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser')
const fetch = require('node-fetch');
var passport = require('passport');

var authRoutes = require('./src/routes/auth.route');
const City = require('./src/models/City.model')
const District = require('./src/models/District.model')
const Ward = require('./src/models/Ward.model');


const app = express();
const port = process.env.PORT || 5000;

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, { useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('DB Connected!'))
    .catch(err => {console.log('DB Connection Error: '+err.message);});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
    // console.log('---------')
    // District.find({city: 1})
    //     .then(results => results.map(item=> item.remove()))
    // return res.status(200).json('Done')
    // await fetch('https://thongtindoanhnghiep.co/api/city/4/district', { method: 'GET'})
    // .then(res => res.json())
    // .then(json => json.map((item, index)=> {
    //     const district = new District({city: 3, code: index, title: item.Title});
    //     district.save();
    // }));

    // let str =' Cẩm Lệ, Hải Châu, Liên Chiểu, Ngũ Hành Sơn, Thanh Khê'
    // let arr = str.split(',')
    // arr.map( async (item, index) => {
    //     // const district = new District({city: 3, code: index, title: item})
    //     await new District({city: 1, code: index, title: `Quận${item}`}).save();
    // })

    // let str =' Bưởi, Nhật Tân, Phú Thượng, Quảng An, Thụy Khuê, Tứ Liên, Xuân La, Yên Phụ.'
    // let arr = str.split(',')
    // arr.map( async (item, index) => {
    //     // const district = new District({city: 3, code: index, title: item})
    //     await new Ward({city: 2, district:10, code: index, title: `Phường${item}`}).save();
    // })

    return res.status(201).json('Hi')
})

app.get('/:id', async (req, res) => {
    District.findByIdAndDelete({city: 3})
    return res.status(201).json('Done')
})
app.get('/api/cities', async (req, res) => {
    City.find()
    .then(result => res.status(201).json(result))
})

app.get('/api/city/:id', async (req, res) => {
    const id = req.params.id;

    District.find({city: id})
    .then(result => res.status(201).json(result))
})  
app.get('/api/address/:idCity/:idDistrict/:idWard', async (req, res) => {
    let address = []
    const { idCity, idDistrict, idWard }= req.params;
    await City.find({code: idCity}).then(result => address = [...address,{city: result[0].title}])
    await District.find({city: idCity,code: idDistrict}).then(result => address = [...address,{district: result[0].title}])
    await Ward.find({ city: idCity, district: idDistrict ,code: idWard}).then(result => address = [...address,{ward: result[0].title}])
    return res.status(201).json({address, str :`, ${address[2].ward}, ${address[1].district}, ${address[0].city}`});
}) 

app.get('/api/city/:idCity/district/:idDistrict', async (req, res) => {
    const { idCity, idDistrict}= req.params;
    console.log(idCity, idDistrict)
    Ward.find({city: idCity, district: idDistrict})
        .then(result => res.status(201).json(result))
}) 

app.post('/api/key_code',  async (req, res) => {
    const { address } = req.body;
    let result = {
        apartment_number: '',
        street: '',
        ward: -1,
        district: -1,
        city: -1,
    }
    let list = address.split(',');
    await Ward.find({title: list[1].trim()}).then(res =>  result.ward = res[0].code);
    await District.find({title: list[2].trim()}).then(res =>  result.district = res[0].code);
    await City.find({title: list[3].trim()}).then(res =>  result.city = res[0].code);
    list = list[0].split(' ');
    result.street = list[1];
    result.apartment_number = list[0];
   res.send(result)
})

app.listen(port, function() {
    console.log('Server listening on port ' + port);
});
