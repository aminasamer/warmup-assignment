const fs = require("fs");

function convertToSeconds(timeStr) {
    let time = timeStr.trim().toLowerCase();

    if (time.includes("am") || time.includes("pm")) {
        let parts = time.split(" ");
        let clock = parts[0];
        let period = parts[1];

        let clockParts = clock.split(":");
        let hours = parseInt(clockParts[0]);
        let minutes = parseInt(clockParts[1]);
        let seconds = parseInt(clockParts[2]);

        if (period === "am") {
            if (hours === 12) hours = 0;
        } else if (period === "pm") {
            if (hours !== 12) hours += 12;
        }

        return hours * 3600 + minutes * 60 + seconds;
    } else {
        let parts = time.split(":");
        let hours = parseInt(parts[0]);
        let minutes = parseInt(parts[1]);
        let seconds = parseInt(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    }
}

function convertSecondsToTime(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;

    let hours = Math.floor(totalSeconds / 3600);
    let remaining = totalSeconds % 3600;
    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;

    let mm = String(minutes).padStart(2, "0");
    let ss = String(seconds).padStart(2, "0");

    return `${hours}:${mm}:${ss}`;
}

function getMonthNumber(dateStr) {
    return parseInt(dateStr.split("-")[1]);
}

function getDayName(dateStr) {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let date = new Date(dateStr);
    return days[date.getDay()];
}

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    let startSeconds = convertToSeconds(startTime);
    let endSeconds = convertToSeconds(endTime);

    if (endSeconds < startSeconds) {
        endSeconds += 24 * 3600;
    }

    let duration = endSeconds - startSeconds;
    return convertSecondsToTime(duration);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
    let startSeconds = convertToSeconds(startTime);
    let endSeconds = convertToSeconds(endTime);

    if (endSeconds < startSeconds) {
        endSeconds += 24 * 3600;
    }

    let deliveryStart = 8 * 3600;   // 8:00 AM
    let deliveryEnd = 22 * 3600;    // 10:00 PM

    let idleSeconds = 0;

    if (startSeconds < deliveryStart) {
        idleSeconds += deliveryStart - startSeconds;
    }

    if (endSeconds > deliveryEnd) {
        idleSeconds += endSeconds - deliveryEnd;
    }

    return convertSecondsToTime(idleSeconds);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
    let shiftSeconds = convertToSeconds(shiftDuration);
    let idleSeconds = convertToSeconds(idleTime);

    return convertSecondsToTime(shiftSeconds - idleSeconds);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
    let activeSeconds = convertToSeconds(activeTime);
    let requiredSeconds;

    if (date >= "2025-04-10" && date <= "2025-04-30") {
        requiredSeconds = 6 * 3600;
    } else {
        requiredSeconds = 8 * 3600 + 24 * 60;
    }
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
    let fileContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        let existingDriverID = parts[0];
        let existingDate = parts[2];

        if (existingDriverID === shiftObj.driverID && existingDate === shiftObj.date) {
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let quotaMet = metQuota(shiftObj.date, activeTime);

    let newObj = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quotaMet,
        hasBonus: false
    };

    let newLine = [
        newObj.driverID,
        newObj.driverName,
        newObj.date,
        newObj.startTime,
        newObj.endTime,
        newObj.shiftDuration,
        newObj.idleTime,
        newObj.activeTime,
        newObj.metQuota,
        newObj.hasBonus
    ].join(",");

    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts[0] === shiftObj.driverID) {
            insertIndex = i;
        }
    }

    if (insertIndex === -1) {
        lines.push(newLine);
    } else {
        lines.splice(insertIndex + 1, 0, newLine);
    }

    fs.writeFileSync(textFile, lines.join("\n"), { encoding: "utf8" });

    return newObj;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
    let fileContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");

        if (parts[0] === driverID && parts[2] === date) {
            parts[9] = String(newValue);
            lines[i] = parts.join(",");
            break;
        }
    }

    fs.writeFileSync(textFile, lines.join("\n"), { encoding: "utf8" });
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
    let fileContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
    let lines = fileContent === "" ? [] : fileContent.split("\n");

    let targetMonth = parseInt(month);
    let foundDriver = false;
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");
        let currentDriverID = parts[0];
        let currentMonth = parseInt(parts[2].split("-")[1]);
        let hasBonus = parts[9].trim() === "true";

        if (currentDriverID === driverID) {
            foundDriver = true;

            if (currentMonth === targetMonth && hasBonus) {
                count++;
            }
        }
    }

    if (!foundDriver) {
        return -1;
    }

    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
