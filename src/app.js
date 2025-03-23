import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express();
app.use(
    cors(
        {
            origin : process.env.FRONTEND_URI,
            credentials : true
        }
    )
)

app.use(
    express.urlencoded({
        limit:"32kb",
        extended:true
    })
)
app.use(
    express.json(
        {
            limit:"32kb",
            
        }
    )
)
app.use(
    cookieParser()
  )
app.use(
    express.static(
        "public"
    )
)
import userRoutes from './routes/user.routes.js'
import restaturantRoutes from './routes/restaurant.routes.js'
import adminRoutes from './routes/admin.routes.js'
app.use('/api/v1/userRoutes' , userRoutes)
app.use('/api/v1/restaurantRoutes' , restaturantRoutes)
app.use('/api/v1/adminRoutes' , adminRoutes)
export default app