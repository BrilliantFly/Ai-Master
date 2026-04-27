package com.know.knowboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 摄像头管理系统启动类
 */
@SpringBootApplication(scanBasePackages = "com.know.knowboot")
public class KnowBootCameraApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(KnowBootCameraApplication.class, args);
    }
}