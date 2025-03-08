import { Router } from 'express'
import { restaurantLogin, restaurantLogout, restaurantRegister } from '../controllers/restauratnt.controller.js'
import { verifyRest } from '../middlewares/verifyJwt.js'
import { upload } from '../middlewares/multer.js'
const router = Router()
router.route('/register-restaurant').post( upload.fields(
    [
        {
            name : "restImage",
            maxCount: 5,
        },
        {
            name : "foodImage",
            maxCount: 5,
        },
        {
            name : "restFssaiImage",
            maxCount: 1,
        },
        {
            name : "restGstImage",
            maxCount: 1,
        },
        {
            name : "restPanImage",
            maxCount: 1,
        },

    ]
) ,restaurantRegister)
router.route('/login-restaurant').post(restaurantLogin)
router.route('/logout-restaurant').post(verifyRest,restaurantLogout)
export default router