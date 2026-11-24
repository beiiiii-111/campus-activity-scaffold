package top.yixz.activity.controller;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import top.yixz.activity.common.DateTimes;
import top.yixz.activity.common.Result;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 探活与自检接口：验证「服务可启动 + 统一响应体生效 + 参数校验异常被翻译」。
 * 三端联调时先请求它，能排除"后端没起 / 端口不对 / 代理没配对"这类问题。
 */
@Validated
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PingController {

    @Value("${spring.application.name}")
    private String appName;

    @GetMapping("/ping")
    public Result<Map<String, Object>> ping() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("app", appName);
        data.put("serverTime", DateTimes.format(LocalDateTime.now()));
        data.put("apiPrefix", "/api");
        return Result.ok(data);
    }

    /** 故意留一个会被校验拦下的入参，用来演示 50001 参数错误分支 */
    @GetMapping("/ping/echo")
    public Result<String> echo(@RequestParam @NotBlank(message = "msg 不能为空") String msg) {
        return Result.ok("pong: " + msg);
    }
}
