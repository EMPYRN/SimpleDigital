/**** BEGIN KPAY IMPORTS - REQUIRED ****/
/*
 * If you want (a lot of) logging from the K·pay library,
 * replace "release" with "debug" in the import path below
 */
import * as kpay from './kpay/release/kpay_companion.js';
import * as kpay_common from '../common/kpay/kpay_common.js';
/**** END KPAY IMPORTS ****/

import * as comp from "./comp.js";

/**** KPAY INIT - REQUIRED ***/
kpay.initialize();
comp.initialize();
