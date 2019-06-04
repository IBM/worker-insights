<!-- Put badges at the very top -->
<!-- Change the repo -->
[![Build Status](https://travis-ci.org/IBM/watson-banking-chatbot.svg?branch=master)](https://travis-ci.org/IBM/watson-banking-chatbot)

<!-- Add a new Title and fill in the blanks -->
# IoT - Tracking Employee Workplace Conditions using "Worker Insights" Service

In this Code Pattern, we'll configure a system that has the ability to monitor safety conditions in a workplace.

This is implemented by analyzing data collected from wearable sensors equipped by employees. These sensors have the ability to track environmental conditions (temperature, pollutants), biometric conditions (heart rate, movement) of employees, and proximity to certain areas.

When the reader has completed this Code Pattern, they will understand how to:
- Stream sensor data to both the Watson IoT Platform and "Event Streams" services
- Persist historical sensor data in an object store
- Create and deploy a "shield" to run analytics against data streams and trigger events
<!-- - Detect user proximity to certain zones in workplace  -->

<!--add an image in this path-->
![](https://i.imgur.com/HHkAyW2.png)

<!--Optionally, add flow steps based on the architecture diagram-->
## Flow

1. Equip employees with wearable devices. Connect wearables to cloud enabled gateway via Bluetooth.
2. Forward wearable sensor data to Watson IoT Platform and "Event Streams" services.
3. Raw data and recognized "events" are archived in Object Storage service.
4. Data streams get analyzed by "shields", which are Javascript code snippets that can run either on an edge device or in the cloud.
5. Detected events / hazards are displayed in dashboard, mobile application.

<!-- Optionally, update this section when the video is created -->
# Watch the Video

[![](https://img.youtube.com/vi/rV16qJGSVLY/1.jpg)](https://www.youtube.com/watch?v=rV16qJGSVLY)

# Steps

<!-- there are MANY updates necessary here, just screenshots where appropriate -->
1. [Deploy Cloud Services](#1-provision-watson-services-via-ibm-cloud-dashboard)
2. [Configure hardware](#2-configure-hardware)
3. [Configure services](#3-configure-services)
4. [Create custom shield](#4-create-custom-shield)

### 1. Provision Watson services via IBM Cloud dashboard

Create the following services:
* [**Watson IoT Platform**](https://cloud.ibm.com/catalog/services/internet-of-things-platform)
* [**Streaming Analytics (IBM Streams)**](https://cloud.ibm.com/catalog/services/streaming-analytics)
* [**Cloud Object Storage**](https://cloud.ibm.com/catalog/services/cloud-object-storage)
* [**Worker Insights**](https://www.ibm.com/us-en/marketplace/iot-safer-workplace)


### 2. Configure hardware
There are several sensors that can be used with Worker Insights. The full list of supported devices can be seen [here](https://www.ibm.com/support/knowledgecenter/en/SSQNYQ_bas/iot-insurance/safer_workplace/worker_device_support.html)

In this example, we'll be using the following to get started
- [TI Sensortag](http://www.ti.com/tool/TIDC-CC2650STK-SENSORTAG)
<!-- - Garmin vívosmart® 3 (Smart Watch) -->
- Android Mobile device (Using Nexus 6P here, Samsung Galaxy should work as well)

We'll start by connecting the SensorTag to our Android Device via Bluetooth. This can be done by enabling Bluetooth on the Android phone, and pressing the power button on the SensorTag. Once it's on, the led light on the SensorTag should blink repeatedly.
<p align="center">
<img src="https://i.imgur.com/vgUWWQj.png" height="300" width="400" />
</p>

To forward sensor values from the SensorTag to the phone, download the official [TI SensorTag application](https://play.google.com/store/apps/details?id=com.ti.ble.sensortag) from the Google play store.

Upon opening the application, a list of all Bluetooth LTE devices within range will be displayed. Select the option titled "TI SensorTag <Version>"
<p align="center">
<img src="https://i.imgur.com/WZKJNVx.png" height="400" width="200" />
</p>

After selecting the Sensortag, a list of sensor values will be displayed and updated frequently in real time like so
<p align="center">
<img src="https://i.imgur.com/f7oVUSX.png" height="400" width="200" />
</p>

Enabling the "Push to Cloud" option will constantly publish JSON payloads to a public "quickstart" Watson IoT Platform service. This quickstart service renders line graphs of each tracked sensor value. These sensor values can be viewed in the IoT Platform console by visiting the following link, and then entering the organization id https://quickstart.internetofthings.ibmcloud.com/#/.
<p align="center">
<img src="https://i.imgur.com/nd4L6s3.png"  />
</p>

### 3. Configure services
Configure Worker Insights dashboard + Mobile Application

We can move forward by configuring the Worker Insights mobile application and service.
Assuming that we have access to the Worker Insights dashboard, we can now navigate to the dashboard and log in using the provided credentials.

Upon logging in, we'll see a default view "supervisor" view, and essentially shows an overview of all recently detected events. This includes a heat map, a line graph of the various detected events, and the amount of registered Shield, Devices, Users, and Hazards.
<p align="center">
<img src="https://i.imgur.com/4Vzu1nD.png"  />
</p>

To simulate a hazard event using our mobile device, we can move forward by navigating to the "Enrollment" section in the left hand menu. Next, install a QR scanner on your Android device, and use it to scan the "Worker App Android Binary" and "Worker App Android Config" QR codes.

After following the links provided by the QR codes, an .apk and .ashx configuration file should have been downloaded to the mobile device. Selecting the .apk file will invoke the installation process for the Employee Insights mobile app. The .ashx file includes required information for the mobile device to connect back to the Watson IoT service.

After installing the mobile application, open it and log in with the proper credentials.
<!-- TODO, paste image -->
Select the sensors that'll be used (Sensortag in bottom left corner), and then click "Start Shift"
<p align="center">
<img src="https://i.imgur.com/xWlUDLB.png" height="400" width="200" />
</p>

Now if we press the "panic button", a notification will be displayed in both the Android "worker" application and in the Desktop "supervisor" dashboard.
<!-- TODO, paste image -->
<p align="center">
<img src="https://i.imgur.com/tVCULFi.png" height="400" width="200" />
</p>

<p align="center">
<img src="https://i.imgur.com/Vr7uXQk.png"  />
</p>

In this context, the Android phone can serve as an edge device, meaning it can perform low-level data analysis locally instead of using cloud resources.

### 4. Create custom shield

Clone the `iot-worker-insights` repository locally. In a terminal, run:

```
$ git clone https://github.com/IBM/iot-worker-insights
```

There are several starter shields already built into the Worker Insights service instance. These shields have the ability to analyze streaming data, and issue alerts whenever a potential hazard has been detected.

As seen in the image below, there are several hazards that can be detected, such as a fatigued worker, excessive temperature, missing safety equipment, and more.
<p align="center">
<img src="https://i.imgur.com/TAKGpVs.png"  />
</p>
<!-- TODO, paste image -->

Each shield has three primary steps:
- entryCondition: The entryCondition method validates the incoming data and confirms that the relevant data is contained in the payload. If the checks are successful, this method returns either a "true" boolean value or the original payload
- preProcessing: the preProcessing method is called to sanitize/modify the original payload, this method is optional
- processing: this method contains the majority of the business logic, and determines whether a hazard event should be triggered or not. If a hazard is detected, this method forwards the hazard message into a stream.

See the following link for more information [here](https://github.com/ibm-watson-iot/ioti-shields/tree/master/worker-insights)

In this example, we'll create a simple shield to measure exposure to artificial light, and send a notification when the light intensity exceeds a certain level. In certain workplaces such as power plants, research labs, etc, workers can develop health conditions if they're exposed to infrared or ultraviolet lighting for too long. The code for the shield can be seen in the `hasLightingIntensityShield.js` file, which is located in the `shields` directory.

Each of the above functions accept a "payload" object, which contains the data received by the wearable device(s).

Many of the functions also accept a "shieldContext" object as well, which contains specific information about the shield, such as the id, hazard threshold, and last observed sensor values
<!-- TODO, the above sentence is inferred from the sample shield code that was sent to the slack channel. However, not seeing any shieldContext argument in the public github examples. https://github.com/ibm-watson-iot/ioti-shields/tree/master/worker-insights -->

"Preprocessing" shield
```
var insufficientLightingPreProcessing = function(shieldContext, payload){

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
```

"Processing / Safelet"
(TODO question, this is referred to as "safelet" in the example, but appears to be the processing method, need to confirm)

The "processing" method contains the bulk of the shield logic. In this simple use case, we're looking to determine whether the light intensity exceeds the allowed amount. If it does, an alert should be issued to the worker and supervisor.

This can be done by creating a function to parse the light intensity value from the payload, as well as the safety threshold set in the shield context. Once these values are extracted, they can be compared. If the value exceeds the threshold, the payload gets returned.
```
var shieldParams = getShieldParams(shieldContext.shieldId, payload.userId);
var checkBrightnessThreshold = function (payload) {
  if (payload.d.light) {
    var brightnessThreshold = parseInt(shieldParams.brightnessThreshold);
    if (payload.d.light > brightnessThreshold) {
      return payload;
    }
  }
};
```

The following function generates a "hazard" if the light intensity exceeds the threshold. In the hazard definition, we'll define a risk level, represented by a integer. This hazard is then triggered, and all parties receive a notification
```
if ( checkBrightnessThreshold(payload) ) {
  var hazardInfo = {
    riskLevel: {
      title: 'Excessive Lighting Exposure',
      level: 100
    }
  }
  var hazardPayload = createHazardSkeletonMsg(payload, shieldContext.shieldId, 'LightingIntensity', hazardInfo, shieldParams.iot_messages.hazardTitle, 'detected');
  return [hazardPayload];
}
```

The custom shield node.js file, titled "hasLightingIntensityShield.js" can then be uploaded directly to the Worker Insights dashboard by going through the following steps.

Navigate to the "shields" section in the left hand menu, and click the "Add shield" button.
<p align="center">
<img src="https://i.imgur.com/6J5XNz6.png"  />
</p>

Enter values for the following fields
- Name
- Description
- Shield Actions: Determines exactly what happens when the hazard is triggered. The actions we'll use are "IOC PUSH", which publishes a message through the IoT Platform to all subscribers. We'll also use the "Notify Supervisor" action, which generates an alert in all supervisor dashboards and mobile applications
- Shield Type: Determines whether logic is executed on the Worker device or on the cloud
- Shield Parameters: This is where we can pre-define certain variables. In this case, we'll define the "brightnessThreshold" variable, to define a safe level of lighting exposure

After the shield has been created, click the "Add shield Code" button to upload the associated node.js file. Be sure to check the "Enabled" box as well
<p align="center">
<img src="https://i.imgur.com/fpdw8rl.png"  />
</p>

<!-- TODO, add picture  -->

Now, if any connected wearable devices detect a lighting level above the threshold defined in the shield parameters, a hazard will be triggered in both the supervisor dashboard and mobile application.

**TODO, blocked here...not able to trigger or debug shield..not seeing any debugging/logging mechanisms in the dashboard demo.
Can we get access to the additional services? Watson IoT Platform, Event Streams (Kafka), Streaming Analytics (IBM Streams)**
<!--
### Notes / TODOs / Blockers (Remove this section when we submit)

#### Blockers:
Gradle build fails with both kafka, messagehub toolkits
```
git clone https://github.com/IBMStreams/streamsx.kafka
cd streamsx.kafka/com.ibm.streamsx.kafka
../gradlew build
```
Gradle build also fails with shield toolkit
https://github.com/ibm-watson-iot/ioti-shields/tree/master/shield-toolkit
-->
Notes:
IBM Streams Video: https://www.youtube.com/watch?v=HLHGRy7Hif4

IBM Streams demo (can't run until kafka/messagehub toolkit build works)
https://github.com/IBMStreams/streamsx.objectstorage/tree/master/demo/data.historian.event.streams.cos.exactly.once.semantics.demo

<!-- ```
brew install java
brew install ant
brew install maven
```

Template
- Queryable Simple Shield
- Queryable Complex Shield


Or, download the pre-built
https://github.com/IBMStreams/streamsx.iot/releases/download/v0.7.0/com.ibm.streamsx.iot.watson.apps.IotPlatform.sab
 -->


# Troubleshooting

* Error: Environment {GUID} is still not active, retry once status is active

  > This is common during the first run. The app tries to start before the Discovery
environment is fully created. Allow a minute or two to pass. The environment should
be usable on restart. If you used `Deploy to IBM Cloud` the restart should be automatic.

* Error: Only one free environment is allowed per organization

  > To work with a free trial, a small free Discovery environment is created. If you already have
a Discovery environment, this will fail. If you are not using Discovery, check for an old
service thay you may want to delete. Otherwise use the .env DISCOVERY_ENVIRONMENT_ID to tell
the app which environment you want it to use. A collection will be created in this environment
using the default configuration.

<!-- keep this -->

#### Services

Watson IoT Platform
https://cloud.ibm.com/catalog/services/internet-of-things-platform

IBM Streams (Streaming Analytics)
https://cloud.ibm.com/catalog/services/streaming-analytics

Cloud Object Storage
https://cloud.ibm.com/catalog/services/cloud-object-storage

Worker Insights
https://www.ibm.com/us-en/marketplace/iot-safer-workplace

#### Additional Docs
Maximo Worker Insights API
https://www.ibm.com/support/knowledgecenter/SSQNYQ_bas/iot-insurance/iotinsurance_rest_apis.html

Swagger API
https://iotworkerinsights.ibm.com/docs/

Shields Git
https://github.com/ibm-watson-iot/ioti-shields

## License

This code pattern is licensed under the Apache License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1](https://developercertificate.org/) and the [Apache License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache License FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
