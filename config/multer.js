const multer = require('multer')
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/profile_pictures");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/admin-${file.fieldname}-${req.user._id}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    console.log("Inside Destination")
    if (file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "jpeg") {
        cb(null, true);
    } else {
        cb(new Error("Not a jpg/jpeg File!!"), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

module.exports = upload