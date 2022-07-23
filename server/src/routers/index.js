const authRouter = require('./authRouter')
const userRouter = require('./userRouter')
const postRouter = require('./postRouter')
const router = (app) =>{
    app.use('/api',authRouter)
    app.use('/api',userRouter)
    app.use('/api',postRouter)

}

module.exports = router