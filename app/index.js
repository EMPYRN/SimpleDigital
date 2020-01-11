// K-pay Components
import * as kpay from "./kpay/release/kpay.js";
import * as kpay_common from "../common/kpay/kpay_common.js";
import "./kpay/release/kpay_filetransfer.js";
import "./kpay/release/kpay_dialogs.js";
import "./kpay/release/kpay_time_trial.js";
import "./kpay/release/kpay_msg_validation.js";
// End K-pay components
import * as simpleDigitalClock from "./simple_digital_clock.js";
import clock from "clock"

kpay.initialize(); // Init k-pay components
simpleDigitalClock.init();