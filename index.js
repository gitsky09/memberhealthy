const path = require("path");
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const fs = require("fs");
const multer = require("multer");
const app = express();

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "gn01460072",
  database: "family_health",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected...");
});

const img_folder = "/images/pic/";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public" + img_folder);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "mypicture" + "-" + Date.now() + "." + file.originalname.split(".")[1]
    );
  },
});

var upload = multer({ storage: storage });
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assets", express.static(__dirname + "/public"));

// ==================================================== 家族管理 ====================================================

app.get("/", function (req, res) {
  res.render("index_view");
});

app.post("/create-family", upload.single("image"), (req, res) => {
  let familyCode = getRandomCode();
  let familyData = {
    family_name: req.body.family_name,
    family_code: familyCode,
    phone: req.body.phone,
  };

  let createFamilySql = "INSERT INTO family SET ?";
  conn.query(createFamilySql, familyData, (err, results1) => {
    if (err) throw err;
    let familyId = results1.insertId;

    let createMemberSql = "INSERT INTO member SET ?";
    let data = {
      image_path: req.file
        ? img_folder + req.file.filename
        : img_folder + "default.png",
      name: req.body.p_mebname,
      birthdate: req.body.p_mebbir,
      sex: req.body.p_mebsex,
      nickname: req.body.p_mebnn,
      family_id: familyId,
    };

    conn.query(createMemberSql, data, (err, results2) => {
      if (err) throw err;

      let memberId = results2.insertId;

      let updateFamilySql = "UPDATE family set contact = ? where family_id = ?";
      conn.query(updateFamilySql, [memberId, familyId], (err, results3) => {
        if (err) throw err;
        res.redirect("/homepage/" + familyCode);
      });
    });
  });
});

app.post("/find-family-code", (req, res) => {
  let sql = "select family_code from family where phone = ?";
  conn.query(sql, req.body.phone, (err, results) => {
    if (err) throw err;
    res.setHeader("Content-Type", "application/json");

    res.end(
      JSON.stringify({
        code: results[0] ? results[0].family_code : "not found",
      })
    );
  });
});

app.get("/homepage/:code", function (req, res) {
  let code = req.params.code;

  let sql =
    "SELECT f.*, m.* FROM family f inner join member m on f.contact = m.member_id and f.family_code = ?";
  conn.query(sql, code, (err, family) => {
    if (err) throw err;
    if (family.length == 0) {
      res.redirect("/");
    } else {
      let membersSql =
        "SELECT m.member_id, m.name,DATE_FORMAT(m.birthdate,'%Y/%m/%d')as birthdate,m.sex,m.nickname,m.image_path, m.member_id != f.contact as isNotContact \
      FROM member m inner join family f on f.family_id = m.family_id  where m.family_id = ? ORDER BY member_id";

      conn.query(membersSql, family[0].family_id, (err, members) => {
        if (err) throw err;

        res.render("familylist_view", {
          family: family[0],
          results: members,
        });
      });
    }
  });
});

function getRandomCode() {
  let characters = "0123456789abcdefghijklmnopqrstuvwxyz";
  let code = "";
  var randomnumber = 0;
  while (code.length < 6) {
    randomnumber = Math.floor(characters.length * Math.random());
    code += characters.substring(randomnumber, randomnumber + 1);
  }
  console.log("code: " + code);
  return code;
}

// ==================================================== 成員管理 ====================================================

app.post("/add-member", upload.single("image"), (req, res) => {
  let sql = "INSERT INTO member SET ?";

  let data = {
    image_path: req.file
      ? img_folder + req.file.filename
      : img_folder + "default.png",
    name: req.body.p_mebname,
    birthdate: req.body.p_mebbir,
    sex: req.body.p_mebsex,
    nickname: req.body.p_mebnn,
    family_id: req.body.family_id,
  };

  conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect("/homepage/" + req.body.family_code);
  });
});

app.post("/update-member", upload.single("image"), (req, res) => {
  if (req.file) {
    let sql =
      "UPDATE member SET name='" +
      req.body.p_mebname +
      "', birthdate='" +
      req.body.p_mebbir +
      "', \
    sex='" +
      req.body.p_mebsex +
      "', nickname='" +
      req.body.p_mebnn +
      "', image_path='" +
      img_folder +
      req.file.filename +
      "' WHERE member_id=" +
      req.body.p_mebid;

    conn.query(sql, (err, results) => {
      if (err) throw err;
      if (req.body.old_pic.trim() != img_folder + "default.png") {
        let d_path = "./public" + req.body.old_pic.trim();
        fs.unlink(d_path, function () {
          console.log("已經刪除檔案!");
        });
      }
      res.redirect("/homepage/" + req.body.family_code);
    });
  } else {
    let sql =
      "UPDATE member SET name='" +
      req.body.p_mebname +
      "', birthdate='" +
      req.body.p_mebbir +
      "', \
    sex='" +
      req.body.p_mebsex +
      "', nickname='" +
      req.body.p_mebnn +
      "' WHERE member_id=" +
      req.body.p_mebid;

    conn.query(sql, (err, results) => {
      if (err) throw err;
      res.redirect("/homepage/" + req.body.family_code);
    });
  }
});

app.post("/delete-member", function (req, res) {
  let sql1 = "DELETE from health_record where member_id = ?";

  conn.query(sql1, req.body.p_mebid, (err, results) => {
    let sql2 = "DELETE FROM member WHERE member_id = ?";

    conn.query(sql2, req.body.p_mebid, (err, results) => {
      if (err) throw err;

      if (req.body.old_pic.trim() != img_folder + "default.png") {
        let d_path = "./public" + req.body.old_pic.trim();
        fs.unlink(d_path, function () {
          console.log("已經刪除檔案!");
        });
      }

      res.redirect("/homepage/" + req.body.family_code);
    });
  });
});


// ==================================================== 健康紀錄管理 ====================================================

app.get("/records/:code", function (req, res) {
  let code = req.params.code;

  let memberId = req.query.member_id
  let symptoms = req.query.symptoms;
  let placeVisited = req.query.place;
  let startDate = req.query.date_start;
  let endDate = req.query.date_end;
  let startTemp = req.query.temp_start;
  let endTemp = req.query.temp_end;

  let conditions = [];

  if (startDate && endDate)
    conditions.push(
      `r.date_recorded between '${startDate} 00:00:00' and '${endDate} 23:59:59'`
    );
  
  if (startTemp && endTemp) conditions.push(`r.temp between ${startTemp} and ${endTemp}`);

 
  if (symptoms) conditions.push(`r.symptoms like '%${symptoms}%'`);

  
  if (placeVisited) conditions.push(`r.place_visited like '%${placeVisited}%'`);

  if (memberId) conditions.push(`r.member_id = ${memberId}`)

 
  let sql = "SELECT r.*, DATE_FORMAT(r.date_recorded,'%Y/%m/%d %H:%i') as r_date, m.nickname FROM family_health.health_record r inner join member m on m.member_id = r.member_id \
   where m.family_id = (select family_id from family where family_code = ?) ";
  
  if (conditions.length > 0) {
    sql += " AND ";
    sql += conditions.length === 1 ? conditions[0] : conditions.join(" AND ");
  }

  sql += " order by r.date_recorded desc"
  //console.log(sql);

  conn.query(sql, code, (err, results) => {
    if (err) throw err;

    let memberSql = 'select nickname, member_id from member where family_id = (select family_id from family where family_code = ?)'

    conn.query(memberSql, code, (err, members) => {
      if (err) throw err;
      res.render("templist_view", {
        results: results,
        family_code: code,
        members: members
      });
    });

  });

});

app.post("/add-record", (req, res) => {
  let data = {
    date_recorded: req.body.r_date ? req.body.r_date: new Date(),
    temp: req.body.temp,
    symptoms: req.body.symptoms,
    place_visited: req.body.place,
    member_id: req.body.member_id,
  };
  let sql = "INSERT INTO health_record SET ?";
  conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect("/records/" + req.body.family_code);
  });
});



app.post("/update-record", (req, res) => {

  let id = req.body.record_id;
  let data = {
    date_recorded: req.body.r_date,
    temp: req.body.temp,
    symptoms: req.body.symptoms,
    place_visited: req.body.place,
  };
  let sql = "UPDATE health_record SET ? WHERE record_id = ?";
  conn.query(sql, [data, id], (err, results) => {
    if (err) throw err;
    res.redirect("/records/" + req.body.family_code);
  });
});

app.post("/delete-record", function (req, res) {
  let id = req.body.record_id;;
  let sql = "DELETE FROM health_record WHERE record_id = ?";
  
  conn.query(sql, id, (err, results) => {
    if (err) throw err;
    res.redirect("/records/" + req.body.family_code);
  });
});



// ==================================================== 儀錶板管理 ====================================================

app.get("/dashboard/:code", function (req, res) {
  let code = req.params.code;

  let memberSql =
    `select nickname, image_path, '${code}' as family_code,  member_id, member_id not in \
       (select member_id from health_record where temp > 37.5 and date_recorded > curdate() - interval 3 day) as 'status' from member \
       where family_id = (select family_id from family where family_code = ?)`;

  conn.query(memberSql, code, (err, members) => {
    if (err) throw err;

    let recordSql = 
    `select concat(date_format(h.date_recorded,'%Y-%m-%d %H:%i'), ", ", m.nickname, " 體溫過高(",h.temp, "), 症狀: [",h.symptoms,"], 地點: [", h.place_visited, "]") as result \
      from health_record as h \
      left join member as m on m.member_id = h.member_id \
      where h.temp > 37.5 and h.date_recorded > curdate() - interval 3 day \
      and m.family_id = (select family_id from family where family_code = ?)
      order by date_recorded desc`;

    conn.query(recordSql, code, (err, records) => {
      if (err) throw err;
      res.render('dashboard_view',{
        members: members,
        records: records,
        family_code: code
      });
    });
  });
});

//server listening ： 啟動Web Server
app.listen(8000, () => {
  console.log("Server is running at port 8000");
});
