import { Router } from "express";
import { filterPackages, googleLogin, resendOtp, userLogin, userLogout, userRegister, verifyOtp } from "../controllers/user.contoller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
const router = Router();
router.route("/userRegister").post(userRegister)
router.route("/userLogin").post(userLogin)
router.route("/verifyOtp/:userId").post(verifyOtp)
router.route("/userLogout").post(verifyJwt, userLogout)
router.route("/googleLogin").post(googleLogin)
router.route("/resendOtp/:userId").post(resendOtp)
router.route("/filterPackage/:id").post(filterPackages)
export default router