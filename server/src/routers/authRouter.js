const router = require('express').Router();
const authCtrl = require('../controllers/authCtrl');
const { validateRegister, validator, validateLogin, valiedatePassword } = require('../utils/validate');

router.post('/register',validateRegister,validator,authCtrl.register);

router.post('/login',validateLogin,validator,authCtrl.login);

router.post('/logout',authCtrl.logout);

router.post('/refresh_token',authCtrl.generateAccessToken);

router.post('/verify-email',authCtrl.verifyEmail);

router.post('/resend-verify-email',authCtrl.resendVerifyEmail);

router.post('/forget-password',authCtrl.forgetPassword)

router.post('/verify-pass-reset-token',authCtrl.passwordTokenStatus)

router.post('/reset-password',valiedatePassword,validator,authCtrl.resetPassword)

// router.get('/refresh_token',authCtrl.refreshToken)

router.get("/refresh_token",authCtrl.generateAccessToken)

module.exports = router;