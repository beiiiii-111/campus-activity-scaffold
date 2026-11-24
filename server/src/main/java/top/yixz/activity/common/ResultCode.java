package top.yixz.activity.common;

import lombok.Getter;

/**
 * 错误码字典：按业务域分段，前端只认 code，message 直接可展示。
 * 新增错误码时按段追加，不修改已发布码的含义。
 */
@Getter
public enum ResultCode {

    OK(0, "ok"),

    // 10xxx 认证与权限
    UNAUTHORIZED(10001, "未登录或登录已过期"),
    FORBIDDEN(10002, "没有操作权限"),

    // 20xxx 活动
    ACTIVITY_NOT_FOUND(20001, "活动不存在"),
    ACTIVITY_STATUS_INVALID(20002, "活动当前状态不支持该操作"),

    // 30xxx 报名
    SIGNUP_FULL(30001, "名额已满"),
    SIGNUP_REPEATED(30002, "你已报名该活动"),

    // 40xxx 签到
    CHECKIN_TOKEN_INVALID(40001, "签到码无效或已过期，请刷新后重试"),
    CHECKIN_NOT_SIGNED_UP(40002, "你未报名该活动，无法签到"),

    // 50xxx 通用
    SYSTEM_ERROR(50000, "系统繁忙，请稍后再试"),
    PARAM_ERROR(50001, "参数错误"),

    // 70xxx 文件
    FILE_EMPTY(70001, "请选择要上传的文件"),
    FILE_TOO_LARGE(70002, "文件超过大小限制"),
    FILE_TYPE_NOT_ALLOWED(70003, "不支持的文件类型");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
