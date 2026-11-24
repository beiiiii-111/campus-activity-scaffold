package top.yixz.activity.common;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 时间格式统一入口：接口出入参一律用字符串，避开 Jackson 对 LocalDateTime 默认输出 ISO 格式的差异。
 */
public final class DateTimes {

    private static final DateTimeFormatter STANDARD = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateTimes() {
    }

    public static String format(LocalDateTime time) {
        return time == null ? null : time.format(STANDARD);
    }

    /** 支持 2026-10-31 14:00:00 与 2026-10-31T14:00:00 两种写法 */
    public static LocalDateTime parse(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String value = text.trim();
        try {
            return value.contains("T")
                    ? LocalDateTime.parse(value)
                    : LocalDateTime.parse(value, STANDARD);
        } catch (Exception e) {
            throw new BizException(ResultCode.PARAM_ERROR, "时间格式不正确: " + text);
        }
    }
}
