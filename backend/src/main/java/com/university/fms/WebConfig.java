package com.university.fms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // When running locally from the repository, open the frontend directly from Spring Boot.
        registry.addViewController("/").setViewName("forward:/login.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // The Render frontend remains a separate service. Locally, Spring Boot serves ../frontend
        // so the whole project can be started from VS Code without a separate frontend server.
        registry.addResourceHandler("/**")
                .addResourceLocations("file:../frontend/");
    }
}
