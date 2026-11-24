package top.yixz.activity.common;

import java.util.List;

/**
 * 分页响应：字段名固定 records / total / page / size，前端不再做兼容映射。
 * 本阶段还没接持久层，所以不绑定 MyBatis-Plus 的 IPage，由调用方给出四个值。
 */
public record PageResult<T>(List<T> records, long total, long page, long size) {

    public static <T> PageResult<T> of(List<T> records, long total, long page, long size) {
        return new PageResult<>(records, total, page, size);
    }

    public static <T> PageResult<T> empty(long page, long size) {
        return new PageResult<>(List.of(), 0L, page, size);
    }
}
