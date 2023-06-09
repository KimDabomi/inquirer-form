const express = require('express');
const router = express.Router();


// Home
router.get('/', async function (req, res) {

    // DB연결
    // 데이터 가져오기
    // 데이터 수정

    res.render('welcome', {
        test: {"abc" : "mart"}
    });
});

// api - 데이터 구조 보여줄 때는 json명령어
router.get('/json', async function (req, res) {
    res.json(
      {"abc" : "mart2"}  
    );
});

module.exports = router;
