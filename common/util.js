const FormData = require('form-data');
const _ = require('lodash');
const URL = require('url').URL

const util = {};

util.parseError = function (errors) {
    let parsed = {};
    if (errors.name == 'ValidationError') {
        for (let name in errors.errors) {
            const validationError = errors.errors[name];
            parsed[name] = {message: validationError.message};
        }
    } else if (errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
        parsed.username = {message: 'This username already exists!'};
    } else {
        parsed.unhandled = JSON.stringify({
            level: errors.level,
            timestamp: errors.timestamp,
            message: errors.message
        });
    }
    return parsed;
}

util.isLogined = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('errors', {login: 'Please login first'});
        res.redirect('/login');
    }
}

util.noPermission = function (req, res) {
    req.flash('errors', {login: "You don't have permission"});
    req.logout();
    res.redirect('/login');
}

util.getPostQueryString = function (req, res, next) {
    res.locals.getPostQueryString = function (isAppended = false, overwrites = {}) {
        let queryString = null;
        let queryArray = [];
        let page = overwrites.page ? overwrites.page : (req.query.page ? req.query.page : '');
        let limit = overwrites.limit ? overwrites.limit : (req.query.limit ? req.query.limit : '');
        let searchType = overwrites.searchType ? overwrites.searchType : (req.query.searchType ? req.query.searchType : '');
        let searchText = overwrites.searchText ? overwrites.searchText : (req.query.searchText ? req.query.searchText : '');
        let dateType = overwrites.dateType ? overwrites.dateType : (req.query.dateType ? req.query.dateType : '');
        let startDate = overwrites.startDate ? overwrites.startDate : (req.query.startDate ? req.query.startDate : '');
        let endDate = overwrites.endDate ? overwrites.endDate : (req.query.endDate ? req.query.endDate : '');
        let isAuto = overwrites.isAuto ? overwrites.isAuto : (req.query.isAuto ? req.query.isAuto : '');

        if (page) queryArray.push('page=' + page);
        if (limit) queryArray.push('limit=' + limit);
        if (searchType) queryArray.push('searchType=' + searchType);
        if (searchText) queryArray.push('searchText=' + searchText);
        if (dateType) queryArray.push('dateType=' + dateType);
        if (startDate) queryArray.push('startDate=' + startDate);
        if (endDate) queryArray.push('endDate=' + endDate);
        if (isAuto) queryArray.push('isAuto=' + isAuto);

        if (queryArray.length > 0) queryString = (isAppended ? '&' : '?') + queryArray.join('&');

        return queryString || '';
    }
    next();
}

util.convertToTrees = function (array, idFieldName, parentIdFieldName, childrenFieldName) {
    let cloned = array.slice();

    for (let i = cloned.length - 1; i > -1; i--) {
        let parentId = cloned[i][parentIdFieldName];

        if (parentId) {
            let filtered = array.filter(function (elem) {
                return elem[idFieldName].toString() == parentId.toString();
            });

            if (filtered.length) {
                let parent = filtered[0];
                if (parent[childrenFieldName]) {
                    parent[childrenFieldName].unshift(cloned[i]);
                } else {
                    parent[childrenFieldName] = [cloned[i]];
                }

            }
            cloned.splice(i, 1);
        }
    }

    return cloned;
}

util.bytesToSize = function (bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

util.getCurrentDate = () => {
    const current = new Date();
    const timeStamp = new Date(Date.UTC(current.getFullYear(),
        current.getMonth(), current.getDate(), current.getHours(),
        current.getMinutes(), current.getSeconds(), current.getMilliseconds()));
    return timeStamp;
}

util.getComma = (number) => {
    if (!number) {
        return ' - ';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

util.delay = async time => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

util.scheduleGc = function () {
    if (!global.gc) {
        logger.info('[GC] Garbage collection is not exposed');
        return;
    }
    let nextMinutes = Math.random() * 30 + 15;

    setTimeout(function () {
        global.gc();
        logger.info('[GC] Manual gc', process.memoryUsage());
    }, nextMinutes * 60 * 1000);
}

util.validateUrl = function (urlString) {
    try {
        new URL(urlString)
        return true
    } catch {
        return false
    }
}

util.validateEmail = function (sEmail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(sEmail)) {
        return true;
    }
    return false;
}

module.exports = util;
