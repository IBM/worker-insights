var INSUFFICIENT_LIGHTING_SHIELD_NAME = "hasLightingIntensityShield";
var INSUFFICIENT_LIGHTING_SHIELD_DELAY = 1000 * 60;
var INSUFFICIENT_LIGHTING_SHIELD_UUID = "sh_hasLightingIntensityShield"; // SIMULATOR_and_GIT_UUID:"sh_hasExcessiveTemperatureExposureShield", On WS_DEMO:"sh_jznqfi1p", on DHL:"3219615c30915ace6d4475d8e1977d50"

/**
 *   expected paylod:
 *  {
 *    "userId": string,
 *    "vendorId": string,
 *    "vendor": string,
 *    "location": {"latitude":double,"longitude":double},
 *    "timestamp": long,
 *    "light":32
 *  }
 *
 *  shield params:
 *  {
 *    "brightnessThreshold": 70,
 *    "humidityThreshold": 90
 *  }
 **/


// var payload = {
//     "light":32
// }
//
// var shieldContext = {
//   "brightnessThreshold": 70
// }

var LightingIntensityPreProcessing = function(shieldContext, payload){

  shieldContext.riskLevel[payload.userId] = shieldContext.riskLevel[payload.userId] || {};

	if (payload.light) {
    shieldContext.savedBrightness[payload.userId] = payload.light;

		var newMsg = {d: {light: payload.light, params: payload.params, dts: payload.ts}};

		newMsg.d.nrts = new Date().getTime();
		newMsg.deviceId = payload.uuid;
		newMsg.userId = payload.userId;
		newMsg.deviceUUID =  payload.uuid;
		newMsg.location =  payload.location;
		newMsg.extra = payload.extra;

		return newMsg;
	}
};

// var lightingCheckPreProcessing = function(shieldContext, payload){
// 	var newPayload = {d: {temperature: shieldContext.savedAmbientTemperature[payload.userId], humidity: payload.humidity, params: payload.params, dts: payload.timestamp}};
// 	newPayload.d.nrts = new Date().getTime();
// 	newPayload.deviceId = payload.deviceId;
// 	newPayload.userId = payload.userId;
// 	newPayload.deviceUUID =  payload.uuid;
// 	newPayload.location =  payload.location;
// 	newPayload.extra = payload.extra;
//
// 	return newPayload;
// };

var lightingCheckSafelet = function(shieldContext, payload){

  if (payload){

    var shieldParams = getShieldParams(shieldContext.shieldId, payload.userId);

    var checkBrightnessThreshold = function (payload) {
      if (payload.d.light) {
        var brightnessThreshold = parseInt(shieldParams.brightnessThreshold);
        // if (!shieldParams.isCold && (payload.d.temperature > brightnessThreshold)) {
        //   return payload;
        // }

        if (payload.d.light > brightnessThreshold) {
          return payload;
        }
      }
    };

    var payload1 = checkBrightnessThreshold(payload);

    if (payload1) {
      var hazardInfo = {};
      hazardInfo.riskLevel = {
        title: 'LightingIntensity',
        level: 100
      };

      var hazardPayload = createHazardSkeletonMsg(payload, shieldContext.shieldId, 'LightingIntensity', hazardInfo, shieldParams.iot_messages.hazardTitle, 'detected');
      return [hazardPayload];

    }
	}
};

var hasLightingIntensityEntryCondition = function(shieldContext, payload, eventType)  {
	if (payload.light) {
		// removing the user last ambient
		// var index = shieldContext.savedBrightness.indexOf(payload.userId);
    // shieldContext.savedBrightness.splice(index, 1);
    // shieldContext.savedBrightness[payload.userId] = payload.light;
    return payload.light;
	}
};

var hasLightingIntensityMessage = function(payload) {
};

var hasLightingIntensityShield = function(payload){
	var shield = getShieldByName(INSUFFICIENT_LIGHTING_SHIELD_NAME);
	return (commonShield(payload, shield));
};


var hasLightingIntensityInit = function(shieldContext, payload) {
  // Initialize Context Information
  shieldContext.savedBrightness = shieldContext.savedBrightness || [];

  // Use the payload to specify for each Language what are these fields, default is English
  var defaultNotification = {
    hazardTitle: 'Insufficient lighting detected !'
  };
  var iot_messages = payload.iot_messages || defaultNotification;
  var brightnessThreshold = payload.brightnessThreshold ;
  var initParams = {
    brightnessThreshold: brightnessThreshold
    // humidityThreshold: humidityThreshold,
    // isCold: isCold
  };
  setDefaultShieldParams(shieldContext.shieldId, initParams, iot_messages);
};

var hasLightingIntensityHealth = function(shieldContext, payload) {

};


registerShield(INSUFFICIENT_LIGHTING_SHIELD_UUID, INSUFFICIENT_LIGHTING_SHIELD_NAME, hasLightingIntensityEntryCondition, LightingIntensityPreProcessing, lightingCheckSafelet, hasLightingIntensityMessage, hasLightingIntensityHealth, hasLightingIntensityInit, INSUFFICIENT_LIGHTING_SHIELD_DELAY);
