package com.exam.studentrecord.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

/**
 * Global CORS configuration supporting both local Vite dev servers
 * and deployed production frontend domains via environment variables.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOrigins.split(",");
        List<String> validOrigins = new ArrayList<>();

        for (String origin : origins) {
            String trimmed = origin.trim();
            if (!trimmed.isEmpty()) {
                validOrigins.add(trimmed);
                // If origin is supplied without protocol like "student-record-frontend.onrender.com",
                // also allow "https://student-record-frontend.onrender.com"
                if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
                    validOrigins.add("https://" + trimmed);
                    validOrigins.add("http://" + trimmed);
                }
            }
        }

        // Always allow local dev servers for easy testing
        if (!validOrigins.contains("http://localhost:5173")) {
            validOrigins.add("http://localhost:5173");
        }
        if (!validOrigins.contains("http://127.0.0.1:5173")) {
            validOrigins.add("http://127.0.0.1:5173");
        }

        registry.addMapping("/**")
                .allowedOriginPatterns(validOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
