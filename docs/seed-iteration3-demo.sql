-- ============================================================
-- 迭代 3（接口联调与权限）演示数据
-- 用法：mysql -uroot -p < docs/seed-iteration3-demo.sql
-- 说明：只补演示需要的账号与活动，不动已有业务数据；可重复执行
-- ============================================================
USE campus_activity;

-- 0. 重置演示账号在 3050 上的历史报名 / 签到 / 积分，保证每次跑完都是「干净可演示」的状态
--    （演示过程中会真的报一次名、签一次到，重跑脚本就等于把场地收拾干净）
DELETE FROM user_score_record WHERE activity_id = 3050;
DELETE FROM activity_checkin WHERE activity_id = 3050;
DELETE FROM activity_signup WHERE activity_id = 3050;
UPDATE activity SET signed_count = 0 WHERE id = 3050;

-- 1. 组织者账号补手机号：小程序走「手机号 + 验证码」登录，登录后角色仍是 ORGANIZER
UPDATE sys_user SET phone = '13800000002' WHERE username = 'org2001';

-- 2. 审核员账号（后台低权限账号），密码与 admin 一致：Admin@123
--    用途：演示「菜单看不到 + 手输 URL 被 403 + 后端 10002」三段权限收口
INSERT INTO sys_user (id, open_id, nickname, role, username, password_hash, status, create_time, update_time, deleted)
SELECT 9001, 'demo:reviewer01', '审核员小李', 'REVIEWER', 'reviewer01', password_hash, 1, NOW(), NOW(), 0
FROM sys_user WHERE username = 'admin'
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    status = 1,
    deleted = 0;

-- 3. 主链路活动（A08→签到）：开始时间设在 30 分钟后
--    理由：报名要求活动状态仍是「已发布(3)」，而定时任务会在开始时间一到把它推进成「进行中(4)」，
--    所以「还能报名」和「已进入签到窗口（开始前 30 分钟）」只有这 30 分钟重叠。
--    演示时先跑本脚本，再按第四节顺序截图；超时就重跑一次刷新时间。
INSERT INTO activity (id, title, cover_url, category_id, org_id, creator_id, summary, content,
                      start_time, end_time, signup_start_time, signup_end_time, cancel_deadline,
                      location_name, address, latitude, longitude, capacity, signed_count,
                      waitlist_enabled, audit_required, checkin_type, score_type, score, status,
                      view_count, favorite_count, signup_count, publish_time, create_time, update_time, deleted)
VALUES (3050, 'AI 应用实战工作坊（联调演示）', NULL, 1, 2001, 2,
        '拿真实活动跑一遍报名与现场签到，主链路演示用', '现场动手环节，自带笔记本。签到码由组织者在核销台出示。',
        NOW() + INTERVAL 30 MINUTE, NOW() + INTERVAL 4 HOUR,
        NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 3 HOUR, NOW() + INTERVAL 2 HOUR,
        '图书馆 3 楼报告厅', '图书馆 3 楼', 31.2304000, 121.4737000, 60, 0,
        0, 0, 1, 2, 1.0, 3,
        0, 0, 0, NOW(), NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    signup_start_time = VALUES(signup_start_time),
    signup_end_time = VALUES(signup_end_time),
    cancel_deadline = VALUES(cancel_deadline),
    capacity = VALUES(capacity),
    status = 3,
    audit_required = 0,
    checkin_type = 1,
    deleted = 0;

-- 4. 满员活动：容量 1 且已被李小红占满，张小明再报就是 30001「名额已满」
INSERT INTO activity (id, title, cover_url, category_id, org_id, creator_id, summary, content,
                      start_time, end_time, signup_start_time, signup_end_time, cancel_deadline,
                      location_name, address, capacity, signed_count,
                      waitlist_enabled, audit_required, checkin_type, score_type, score, status,
                      view_count, favorite_count, signup_count, publish_time, create_time, update_time, deleted)
VALUES (3051, '小型读书会（限额 1 人 · 错误演示）', NULL, 1, 2001, 2,
        '用来演示「名额已满」这个业务错误码', '限额 1 人，已有一人报名。',
        NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 2 HOUR,
        NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY,
        '教三 201', '教三 201', 1, 1,
        0, 0, 1, 1, 0.5, 3,
        0, 0, 1, NOW(), NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE
    capacity = 1,
    signed_count = 1,
    status = 3,
    deleted = 0;

INSERT INTO activity_signup (id, activity_id, user_id, signup_no, status, waitlist_seq, create_time, update_time)
VALUES (900101, 3051, 4, 'SIGN3051A', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE status = 1;

-- 5. 复核结果
SELECT 'organizer' AS k, username AS name, role, phone AS extra FROM sys_user WHERE username IN ('org2001', 'reviewer01')
UNION ALL
SELECT 'activity', title, CAST(status AS CHAR), CONCAT(capacity, '/', signed_count) FROM activity WHERE id IN (3050, 3051);
