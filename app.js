const express = require('express')
const app = express()
if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('port', process.env.PORT || 3000)
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const db = require('./models')
const Record = db.Record
const User = db.User

app.use(session({
  secret: 'your secret key', // secret: 定義一組屬於你的字串做為私鑰
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
  // 載入 Passport config
require('./config/passport')(passport)
  // 登入後可以取得使用者的資訊方便我們在 view 裡面直接使用
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
})

app.use(express.static('public'))
app.use('/', require('./routes/homes'))
app.use('/records', require('./routes/records'))
app.use('/users', require('./routes/users'))
app.use('/auth', require('./routes/auths'))

app.listen(app.get('port'), () => {
  console.log(
    'Node.js Server with Express is running.',
    '\033[33m',
    `=> http://localhost:${app.get('port')}`,
    '\033[0m'
  )
})