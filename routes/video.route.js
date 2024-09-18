import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { video } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()


router.route("/addVideo").post(verifyJWT, upload.single("videoFile"), video.addVideo)
router.route("/getVideo").get(verifyJWT, video.getVideo)

export default router;