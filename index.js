const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
require('dotenv').config();
const util = require('./util');
const session = require('express-session');
const passport = require('./config/passport');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const InquirerList = require('./models/modelInquirer');
const HotpayOrderList = require('./models/modelHotpayOrder');
const RobotxtMaria = require('./config/database/robotxtDB');
const KsamhMaria = require('./config/database/ksamhDB');
const HotpayMaria = require('./config/database/hotpayDB');
const phpunserialize = require('php-unserialize');
const schedule = require('node-schedule');
const constants = require('./constants');
const app = express();


mongoose.connect('mongodb+srv://cdabomi60:cdabomi60@cluster0.gtjcyjz.mongodb.net/calllink_admin?retryWrites=true&w=majority');
const db = mongoose.connection;
db.once('open', function () {
    console.log('DB 연결됨');

    // schedule
    const hourSchedule = schedule.scheduleJob('0 * * * *', async function () {
        try {
          
          const aRobotxtWpforms = await RobotxtMaria.query("SELECT form_value FROM wp_wpforms_db");
          const aKsamhWpforms = await KsamhMaria.query("SELECT form_value FROM wp_wpforms_db");
          const aHotpayWpforms = await HotpayMaria.query("SELECT form_value FROM wp_wpforms_db");

          const aRobotxtInquirer = aRobotxtWpforms.map(item => {
            return {
              'type': 'robotxt',
              'username': phpunserialize.unserialize(item.form_value)['이름'],
              'phone': phpunserialize.unserialize(item.form_value)['휴대폰번호'],
              'url': phpunserialize.unserialize(item.form_value)['웹사이트 URL']
            }
          }).filter(Boolean);
        
          const aKsamhInquirer = aKsamhWpforms.map(item => {
            return {
              'type': 'ksamh',
              'username': phpunserialize.unserialize(item.form_value)['이름'],
              'phone': phpunserialize.unserialize(item.form_value)['연락처'],
              'url': phpunserialize.unserialize(item.form_value)['투자 예산 범위']
            }
          }).filter(Boolean);
          const aHotpayInquirer = aHotpayWpforms.map(item => {
            return {
              'type': 'hotpay',
              'name': phpunserialize.unserialize(item.form_value)['이름'],
              'phone': phpunserialize.unserialize(item.form_value)['연락처'],
              'url': phpunserialize.unserialize(item.form_value)['브랜드명']
            }
          }).filter(Boolean);

          const aInquirer = [...aRobotxtInquirer, ...aKsamhInquirer, ...aHotpayInquirer];
          const aNewInquirer = await InquirerList.find();

          let aOnlyInquirer = aInquirer.filter(oInquirer => !aNewInquirer.some(oNewInquirer => oNewInquirer.phone === oInquirer.phone));
          if(aOnlyInquirer) {
            let sMessage = '';
            for (i=0; i<aOnlyInquirer.length; i++) {
              sMessage += `새로운 문의가 있습니다.\n 사이트 : ${aOnlyInquirer[i].type}\n 이름 : ${aOnlyInquirer[i].username}\n 연락처 : ${aOnlyInquirer[i].phone}\n\n`;
            }
            await util.sendTelegram(sMessage, constants.TELEGRAM_CHAT_ID.CALLLINK_INQUIRER_FORM);            
          }
          console.log('aOnlyInquirer',aInquirer.length, aNewInquirer.length, aOnlyInquirer.length );
          for (const item of aOnlyInquirer) {
            const newUpdateData = new InquirerList(item);
            await newUpdateData.save();
          }
  
        } catch (error) {
          console.error('에러 발생: ', error);
        }
    });

    const minuteSchedule = schedule.scheduleJob('*/1 * * * * *', async function () {
      try {

        const aHotpayOrderItems = await HotpayMaria.query("SELECT * FROM wp_woocommerce_order_items");
        const aHotpayOrder = aHotpayOrderItems.map(item => {
          return {
            'type': 'hotpay',
            'id': item.order_item_id,
            'item': item.order_item_name
          }
        }).filter(Boolean);

        const aOrder = [...aHotpayOrder];
        const aNewOrder = await HotpayOrderList.find();
        let aOnlyOrder = aOrder.filter(oOrder => !aNewOrder.filter(oNewOrder => oNewOrder.id === oOrder.id));
        console.log('aOnlyOrder',aOnlyOrder);
        // if(aOnlyOrder) {
        //   let sMessage = '';
        //   for (i=0; i<aOnlyOrder.length; i++) {
        //     sMessage += `주문이 발생했습니다. \n 사이트 : ${aOnlyOrder[i].type}\n 제품 : ${aOnlyOrder[i].item}\n\n`;
        //   }
        //   await util.sendTelegram(sMessage, constants.TELEGRAM_CHAT_ID.CALLLINK_INQUIRER_FORM);            
        // }
        console.log('aOnlyOrder',aOrder.length, aNewOrder.length, aOnlyOrder.length );
        for (const item of aOnlyOrder) {
          const newUpdateOrder = new HotpayOrderList(item);
          await newUpdateOrder.save();
        }

      } catch (error) {
        console.error('에러 발생: ', error);
      }
  });

});

db.on('error', function (err) {
    console.error('DB ERROR : ', err);
});


// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash());

// session,
app.use(session({
    secret: 'dabomi',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://cdabomi60:cdabomi60@cluster0.gtjcyjz.mongodb.net/calllink_admin?retryWrites=true&w=majority',
        collectionName: 't_sessions',
    }),
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));


// Passport
app.use(passport.initialize());
app.use(passport.session());

// locals
app.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    res.locals.util = util;
    next();
});

// Routes
app.use('/', require('./routes/routeHome'));

// error
app.use(function (req, res, next) {
    res.status(400).render('error/404');
});
app.use(function (error, req, res, next) {
    console.error(error)
    res.status(500).render('error/500');
});

// Port setting
const port = 4001;
app.listen(port, '0.0.0.0', function () {
    console.info('server on! http://localhost:' + port);
});

