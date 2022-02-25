# 若 family_health 資料庫存在，則刪除之
drop database if exists family_health;
# 建立 family_health 資料庫
create database family_health;
# 在 family_health 資料庫做後續操作
use family_health;

# 若 family 資料表存在，則刪除之
drop table if exists family;
# 建立 family 資料表
create table family(
	family_id int primary key not null auto_increment,
    family_name nvarchar(50) not null,
    family_code varchar(6) not null unique,
    phone varchar(16) unique,
	contact int);
    
# 若 member 資料表存在，則刪除之
drop table if exists `member`;
# 建立 member 資料表
create table `member`(
    member_id int not null primary key auto_increment,
    image_path varchar(100),
    name nvarchar(10) not null,
    birthdate date not null,
    sex nvarchar(1),
    nickname nvarchar(10),
    family_id  int not null,
    foreign key (family_id) references family(family_id));
    
# 讓 member_id 從1001開始計算  
ALTER TABLE `member` AUTO_INCREMENT=1001;


# 若 healthRecord 資料表存在，則刪除之 
drop table if exists health_record; 
# 建立 healthRecord 資料表     
create table health_record(
	record_id int not null auto_increment primary key,
    date_recorded datetime not null default current_timestamp,
    temp float not null,
    symptoms nvarchar(300), 
    place_visited nvarchar(300), 
    member_id  int not null,
    foreign key (member_id) references `member`(member_id));
 
# 1. 顯示資料表名
show tables; 
# 2. 查看 family 資料表結構
describe family;
# 3. 查看 member 資料表結構
describe `member`;
# 4. 查看 health_Record 資料表結構
describe health_record;


# 新增資料至 family
insert into family(family_name,phone,family_code,contact) values 
	("黃家", "02-12345678","test01",1001),
	("林家", "03-12345678","test02",1002),
	("陳家", "04-12345678","test03",1004),
	("吳家", "05-12345678","test04",1005);

# 新增資料至 member 
insert into `member`(image_path, name,birthdate,sex,nickname,family_id) values 
	("/images/pic/default.png", "黃大智", "1961-08-13","男","爸爸",1),
	("/images/pic/default.png", "林志玲", "1970-02-02","女","媽媽",2),
	("/images/pic/default.png", "黃小明","1993-04-10","男","哥哥",1),
	("/images/pic/default.png", "陳娜娜","2019-12-29","女","妹妹",3),
	("/images/pic/default.png","吳國昌","1944-10-23","男","爺爺",4),
	("/images/pic/default.png", "吳小燕","1952-01-24","女","奶奶",4),
	("/images/pic/default.png", "林佑威", "1948-09-21","男","外公",2),
	("/images/pic/default.png", "陳庭妮", "1955-03-15","女","外婆",3),
	("/images/pic/default.png", "林星星", "2020-10-15","男","孫子",2),
    ("/images/pic/default.png", "吳大雄", "1976-03-15","男","爸爸",4),
    ("/images/pic/default.png", "林小霞", "1980-12-02","女","媽媽",4),
    ("/images/pic/default.png", "吳佩珊", "2001-05-05","女","姊姊",4),
    ("/images/pic/default.png", "吳平偉", "2006-01-27","男","弟弟",4);
    
    
-- select * from `member`;

-- select * from family;

# 新增資料至 health_record
insert into health_record(date_recorded,temp,symptoms,place_visited,member_id) values 
	(NOW() - INTERVAL 4 DAY,38.1,"","",1001),
	(NOW() - INTERVAL 6 DAY,40,'','中午去西門町吃麵線 好吃！ 讚~',1001),
	(NOW() - INTERVAL 3 DAY,36.4,"頭昏腦脹","去輔大醫院看醫生拿藥",1002),
	(NOW() - INTERVAL 2 DAY - INTERVAL 2 HOUR,39,"","去西門町錢櫃跟朋友唱歌聚會",1003),
	(NOW() - INTERVAL 2 DAY,36.2,"很疲憊","信義區上下班",1005),
	(NOW() - INTERVAL 1 DAY,36.9,"","去華西街喝蛇湯",1005),
	(NOW() - INTERVAL 6 DAY,37.2,"流鼻水","跟爺爺去龍山寺買杏仁粉 順便約會啦",1006),
	(NOW() - INTERVAL 1 DAY,36.4,"反胃嘔吐 不知道是不是食物中毒啦","新莊IKEA",1010),
	(NOW() - INTERVAL 3 DAY,37.8,"好像感冒了 身體發冷 有點小發燒","跟朋友去宜蘭一日遊",1011),
	(NOW() - INTERVAL 1 DAY,36.4,"有點小咳嗽～皮膚很癢（應該是過敏不要太擔心）","去了一趟萬華喝一杯茶就回家了喔！",1012),
	(NOW() - INTERVAL 3 Hour,37.1,'',"去大安運動森林公園慢跑",1013),
	(NOW() - INTERVAL 4 Hour,38.1,"發燒 四肢無力 身體很冷","林森北路吃宵夜 喝酒",1005),
	(NOW() - INTERVAL 2 Hour,36.2,"累啦","信義區上下班",1006),
	(NOW() - INTERVAL 1 DAY,36.9,"有點流鼻水","爬陽明山",1006),
	(NOW() - INTERVAL 0.5 Hour,37.8,"四肢無力","北投泡湯",1010),
	(NOW() - INTERVAL 7 Hour,39.0,"拉肚子 發燒","在家跟朋友打牌",1010),
	(NOW() - INTERVAL 0.1 Hour,37.6,"還是很不舒服 還是覺得很冷","去象山散步",1011),
	(NOW() - INTERVAL 1 DAY,40,"咳嗽","萬華喝楊桃汁",1011),
	(NOW() - INTERVAL 9 Hour,37.8,"四肢無力+咳嗽了","烏來泡湯",1011);
    
-- select * from health_record;

-- select distinct nickname, image_path from member as m
-- 	left join health_record as h
-- 	on m.member_id = h.member_id
-- 	where h.temp > 37.5 and (date(h.date_recorded) >= curdate() - interval 1 day) and  (date(h.date_recorded) < curdate());

-- select concat(date_format(date_recorded,'%Y-%m-%d %H:%i'), ", ", nickname, "體溫過高(",temp, "), ",symptoms,", ", place_visited) from health_record as h
-- 	left join member as m
--     on m.member_id = h.member_id
-- 	where h.temp > 37.5 and date(date_recorded) >= curdate() - interval 3 day
--     #and h.place_visited is not null and (h.symptoms like "%拉肚子%" or h.symptoms like "%吐%" or h.symptoms like "%咳嗽%")
--     order by date_recorded desc;