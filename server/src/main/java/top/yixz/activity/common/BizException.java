package top.yixz.activity.common;

import lombok.Getter;

/**
 * 业务异常：只承载"可预期的失败"，由全局异常处理器翻译成统一响应体。
 * 非预期异常（NPE、SQL 错误等）不要包装成它，交给兜底分支记日志。
 */
@Getter
public class BizException extends RuntimeException {

    private final int code;

    public BizException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    /** 同一错误码下需要更具体的提示时用这个构造 */
    public BizException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }
}
