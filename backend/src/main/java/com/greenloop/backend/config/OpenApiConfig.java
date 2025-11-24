package com.greenloop.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.info.Info;


@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI projectOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GreenLoop API")
                        .version("1.0")
                        .description("API documentation for GreenLoop sustainability application")
                );
    }
}
