"use strict";

var fs = require("fs");
var fsextra = require("fs-extra");
var moment = require("moment");
var Helper = require("./helper");

module.exports.write = function(user, network, chan, msg) {
	const path = Helper.getUserLogsPath(user, network);

	try {
		fsextra.ensureDirSync(path);
	} catch (e) {
		log.error("Unabled to create logs directory", e);
		return;
	}

	var format = Helper.config.logs.format || "YYYY-MM-DD HH:mm:ss";
	var tz = Helper.config.logs.timezone || "UTC+00:00";

	var time = moment().utcOffset(tz).format(format);
	var line = `[${time}] `;

	var type = msg.type.trim();
	if (type === "message" || type === "highlight") {
		// Format:
		// [2014-01-01 00:00:00] <Arnold> Put that cookie down.. Now!!
		line += `<${msg.from}> ${msg.text}`;
	} else {
		// Format:
		// [2014-01-01 00:00:00] * Arnold quit
		line += `* ${msg.from} `;

		if (msg.hostmask) {
			line += `(${msg.hostmask}) `;
		}

		line += msg.type;

		if (msg.text) {
			line += ` ${msg.text}`;
		}
	}

	fs.appendFile(
		// Quick fix to escape pre-escape channel names that contain % using %%,
		// and / using %. **This does not escape all reserved words**
		path + "/" + chan.replace(/%/g, "%%").replace(/\//g, "%") + ".log",
		line + "\n",
		function(e) {
			if (e) {
				log.error("Failed to write user log", e);
			}
		}
	);
};
