import { Router } from 'express'
import { upload } from '../middlewares/multer.js'
import { verifyJwt } from '../middlewares/verifyJwt.js'
import { addDish, addListing, addPackage, deletePackage, getAllListing, getAllPackage, getAllRes, getListingById } from '../controllers/admin.controller.js'

const router = Router()
router.route("/add-package").post(verifyJwt,upload.single("image"),addPackage)
router.route("/get-all-packages").get(getAllPackage)
router.route("/dlt-packages/:id").delete(verifyJwt , deletePackage)
router.route("/add-dish/:restaurantId").post(verifyJwt , addDish)
router.route("/add-listing/:restaurantId").post(verifyJwt , addListing)
router.route("/get-all-listings/:packageId").get(getAllListing)
router.route("/get-all-restaurant").get(getAllRes)
router.route("/get-lisitngInfo/:id").get(verifyJwt , getListingById)
export default router